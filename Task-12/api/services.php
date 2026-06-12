<?php
session_start();
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$method = $requestMethod;
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function requireRole($role = 'admin') {
    if (empty($_SESSION['is_admin']) || ($_SESSION['admin_role'] ?? '') !== $role) {
        jsonResponse(['success' => false, 'message' => 'Authentication required'], 401);
    }
}

function sanitize($value) {
    return trim($value);
}

function validateServiceData(array $data, &$errors = []) {
    $title = sanitize($data['title'] ?? '');
    $description = sanitize($data['description'] ?? '');
    $category = sanitize($data['category'] ?? '');
    $status = strtolower(sanitize($data['status'] ?? 'active'));

    if ($title === '') {
        $errors['title'] = 'Title is required.';
    }
    if ($description === '') {
        $errors['description'] = 'Description is required.';
    }
    if ($category === '') {
        $errors['category'] = 'Category is required.';
    }
    if (!in_array($status, ['active', 'inactive'], true)) {
        $errors['status'] = 'Status must be active or inactive.';
    }

    return [
        'title' => $title,
        'description' => $description,
        'category' => $category,
        'status' => $status,
    ];
}

function handleImageUpload($existingUrl = null) {
    global $config;
    $imageUrl = $existingUrl;
    if (!is_dir($config['upload_dir'])) {
        mkdir($config['upload_dir'], 0755, true);
    }

    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        if ($_FILES['image']['size'] > 2 * 1024 * 1024) {
            jsonResponse(['success' => false, 'message' => 'Image must be smaller than 2MB.'], 422);
        }

        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
        $type = function_exists('mime_content_type') ? mime_content_type($_FILES['image']['tmp_name']) : $_FILES['image']['type'];
        if (!isset($allowed[$type])) {
            jsonResponse(['success' => false, 'message' => 'Only JPG, PNG, GIF, and WebP images are allowed.'], 422);
        }

        $filename = uniqid('service_', true) . '.' . $allowed[$type];
        $destination = $config['upload_dir'] . DIRECTORY_SEPARATOR . $filename;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
            jsonResponse(['success' => false, 'message' => 'Image upload failed.'], 500);
        }
        $imageUrl = $config['upload_url'] . '/' . $filename;
    }

    return $imageUrl;
}

function removeUploadedImage($imageUrl) {
    if (!$imageUrl) {
        return;
    }

    $path = realpath(__DIR__ . '/../' . ltrim(str_replace('../', '', $imageUrl), '/'));
    $uploadRoot = realpath(__DIR__ . '/../uploads');
    if ($path && $uploadRoot && strpos($path, $uploadRoot) === 0 && file_exists($path)) {
        @unlink($path);
    }
}

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM services WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $service = $stmt->fetch();
            if (!$service) {
                jsonResponse(['success' => false, 'message' => 'Service not found.'], 404);
            }
            jsonResponse(['success' => true, 'data' => $service]);
        }

        $search = trim($_GET['search'] ?? '');
        $page = max(intval($_GET['page'] ?? 1), 1);
        $perPage = min(max(intval($_GET['per_page'] ?? 10), 1), 50);
        $offset = ($page - 1) * $perPage;

        $params = [];
        $where = '';
        if ($search !== '') {
            $where = 'WHERE title LIKE :search_title OR description LIKE :search_description OR category LIKE :search_category';
            $searchTerm = '%' . $search . '%';
            $params[':search_title'] = $searchTerm;
            $params[':search_description'] = $searchTerm;
            $params[':search_category'] = $searchTerm;
        }

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM services $where");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT * FROM services $where ORDER BY created_at DESC LIMIT :offset, :limit");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->execute();
        $services = $stmt->fetchAll();

        jsonResponse([
            'success' => true,
            'data' => $services,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'pages' => (int)ceil($total / $perPage),
            ],
        ]);
        break;

    case 'POST':
        requireRole();
        $data = $_POST;
        $serviceData = validateServiceData($data, $errors);
        if (!empty($errors)) {
            jsonResponse(['success' => false, 'errors' => $errors], 422);
        }

        $imageUrl = handleImageUpload();
        $sql = 'INSERT INTO services (title, description, image_url, category, status) VALUES (:title, :description, :image_url, :category, :status)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $serviceData['title'],
            ':description' => $serviceData['description'],
            ':image_url' => $imageUrl,
            ':category' => $serviceData['category'],
            ':status' => $serviceData['status'],
        ]);

        jsonResponse(['success' => true, 'message' => 'Service created successfully.', 'data' => ['id' => $pdo->lastInsertId()]], 201);
        break;

    case 'PUT':
        requireRole();
        $body = [];
        if ($requestMethod === 'POST') {
            $body = $_POST;
        } else {
            parse_str(file_get_contents('php://input'), $body);
        }
        $data = $body;
        $serviceData = validateServiceData($data, $errors);
        if (!empty($errors)) {
            jsonResponse(['success' => false, 'errors' => $errors], 422);
        }
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'Service ID required.'], 400);
        }

        $existing = $pdo->prepare('SELECT * FROM services WHERE id = :id');
        $existing->execute([':id' => $id]);
        $service = $existing->fetch();
        if (!$service) {
            jsonResponse(['success' => false, 'message' => 'Service not found.'], 404);
        }

        $imageUrl = $service['image_url'];
        $imageUrl = handleImageUpload($service['image_url']);

        $stmt = $pdo->prepare('UPDATE services SET title = :title, description = :description, image_url = :image_url, category = :category, status = :status WHERE id = :id');
        $stmt->execute([
            ':title' => $serviceData['title'],
            ':description' => $serviceData['description'],
            ':image_url' => $imageUrl,
            ':category' => $serviceData['category'],
            ':status' => $serviceData['status'],
            ':id' => $id,
        ]);

        jsonResponse(['success' => true, 'message' => 'Service updated successfully.']);
        break;

    case 'DELETE':
        requireRole();
        if (!$id) {
            jsonResponse(['success' => false, 'message' => 'Service ID required.'], 400);
        }
        $stmt = $pdo->prepare('SELECT image_url FROM services WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $service = $stmt->fetch();
        if (!$service) {
            jsonResponse(['success' => false, 'message' => 'Service not found.'], 404);
        }
        removeUploadedImage($service['image_url']);
        $delete = $pdo->prepare('DELETE FROM services WHERE id = :id');
        $delete->execute([':id' => $id]);
        jsonResponse(['success' => true, 'message' => 'Service deleted successfully.']);
        break;

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
        break;
}
