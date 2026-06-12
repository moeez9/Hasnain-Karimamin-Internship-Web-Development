<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch about data
    $stmt = $pdo->query("SELECT * FROM about LIMIT 1");
    $aboutData = $stmt->fetch();
    
    if ($aboutData) {
        echo json_encode(['success' => true, 'data' => $aboutData]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No data found']);
    }
} elseif ($method === 'PUT') {
    // Requires authentication
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $putData = json_decode(file_get_contents('php://input'), true);

    $company_name = $putData['company_name'] ?? '';
    $description = $putData['description'] ?? '';
    $mission = $putData['mission'] ?? '';
    $vision = $putData['vision'] ?? '';
    $submitted_image_url = trim($putData['image_url'] ?? '');

    // Validation: fields should not be empty
    $plain_description = trim(strip_tags(str_replace(['<br>', '<br/>', '<br />'], '', $description)));

    if (empty(trim($company_name)) || empty($plain_description) || empty(trim($mission)) || empty(trim($vision))) {
        echo json_encode(['success' => false, 'message' => 'All text fields are required']);
        exit;
    }

    // Fetch current data to handle image update logic
    $stmt = $pdo->query("SELECT * FROM about LIMIT 1");
    $currentData = $stmt->fetch();
    $about_id = $currentData['id'] ?? 1;
    $image_url = $currentData['image_url'] ?? '';

    if ($submitted_image_url !== '') {
        $image_url = $submitted_image_url;
    }

    // Image Upload Handling (Base64)
    if (!empty($putData['image_base64'])) {
        $uploadDir = '../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $base64Data = $putData['image_base64'];
        
        // Extract type and data
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            $extension = strtolower($type[1]); // jpg, png, gif, webp
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (!in_array($extension, $allowedExtensions)) {
                echo json_encode(['success' => false, 'message' => 'Invalid file type']);
                exit;
            }

            $fileData = base64_decode($base64Data);
            if ($fileData === false) {
                echo json_encode(['success' => false, 'message' => 'Failed to decode base64 image']);
                exit;
            }

            $newFileName = uniqid() . '.' . $extension;
            $destination = $uploadDir . $newFileName;
            
            if (file_put_contents($destination, $fileData)) {
                $image_url = 'uploads/' . $newFileName;
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
                exit;
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid base64 image format']);
            exit;
        }
    }

    try {
        $pdo->beginTransaction();

        // Check if record exists
        if ($currentData) {
            // Update
            $stmt = $pdo->prepare("UPDATE about SET company_name = ?, description = ?, mission = ?, vision = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$company_name, $description, $mission, $vision, $image_url, $about_id]);
        } else {
            // Insert (fallback)
            $stmt = $pdo->prepare("INSERT INTO about (company_name, description, mission, vision, image_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$company_name, $description, $mission, $vision, $image_url]);
            $about_id = $pdo->lastInsertId();
        }

        // Add to history
        $stmtHistory = $pdo->prepare("INSERT INTO about_history (about_id, company_name, description, mission, vision, image_url) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtHistory->execute([$about_id, $company_name, $description, $mission, $vision, $image_url]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'About page updated successfully']);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
