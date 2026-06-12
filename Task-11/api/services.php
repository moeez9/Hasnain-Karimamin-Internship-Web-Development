<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/../config/db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(405, 'error', null, 'Method not allowed. Use GET only.');
}

try {
    $pathSlug = trim((string)($_SERVER['PATH_INFO'] ?? ''), '/');
    $slug = $pathSlug !== '' ? $pathSlug : trim((string)($_GET['slug'] ?? ''));
    $resource = trim((string)($_GET['resource'] ?? ''));

    if ($resource === 'categories') {
        getCategories($conn);
    }

    if ($slug !== '') {
        getServiceBySlug($conn, $slug);
    }

    getServices($conn);
} catch (Throwable $e) {
    sendResponse(500, 'error', null, 'Server error while processing services.');
}

function getServices(mysqli $conn): void
{
    $page = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
    $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT) ?: 8;
    $limit = max(1, min(24, $limit));
    $offset = ($page - 1) * $limit;

    $category = trim((string)($_GET['category'] ?? ''));
    $search = trim((string)($_GET['search'] ?? ''));

    if ($category !== '' && !isValidText($category, 60)) {
        sendResponse(400, 'error', null, 'Invalid category value.');
    }

    if ($search !== '' && strlen($search) < 2) {
        sendResponse(200, 'success', [], null, [
            'pagination' => [
                'current_page' => $page,
                'total_pages' => 0,
                'total_items' => 0,
                'items_per_page' => $limit,
            ],
            'filters' => [
                'category' => $category ?: null,
                'search' => $search,
            ],
        ]);
    }

    if ($search !== '' && !isValidSearch($search, 80)) {
        sendResponse(200, 'success', [], null, [
            'pagination' => [
                'current_page' => $page,
                'total_pages' => 0,
                'total_items' => 0,
                'items_per_page' => $limit,
            ],
            'filters' => [
                'category' => $category ?: null,
                'search' => $search,
            ],
        ]);
    }

    $where = ["status = 'active'"];
    $types = '';
    $params = [];

    if ($category !== '') {
        $where[] = 'category = ?';
        $types .= 's';
        $params[] = $category;
    }

    if ($search !== '') {
        $where[] = '(title LIKE ? OR description LIKE ? OR category LIKE ?)';
        $types .= 'sss';
        $like = '%' . $search . '%';
        array_push($params, $like, $like, $like);
    }

    $whereSql = implode(' AND ', $where);

    $countSql = "SELECT COUNT(*) AS total FROM services WHERE $whereSql";
    $countStmt = prepareAndExecute($conn, $countSql, $types, $params);
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
    $countStmt->close();

    $sql = "SELECT id, title, slug, description, image_url, icon, category, price, created_at
            FROM services
            WHERE $whereSql
            ORDER BY created_at DESC, id DESC
            LIMIT ? OFFSET ?";

    $queryTypes = $types . 'ii';
    $queryParams = array_merge($params, [$limit, $offset]);
    $stmt = prepareAndExecute($conn, $sql, $queryTypes, $queryParams);
    $result = $stmt->get_result();

    $services = [];
    while ($row = $result->fetch_assoc()) {
        $services[] = normalizeService($row);
    }
    $stmt->close();

    sendResponse(200, 'success', $services, null, [
        'pagination' => [
            'current_page' => $page,
            'total_pages' => (int)ceil($total / $limit),
            'total_items' => $total,
            'items_per_page' => $limit,
        ],
        'filters' => [
            'category' => $category ?: null,
            'search' => $search ?: null,
        ],
    ]);
}

function getServiceBySlug(mysqli $conn, string $slug): void
{
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
        sendResponse(400, 'error', null, 'Invalid service slug.');
    }

    $sql = "SELECT id, title, slug, description, details, image_url, icon, category, price, status, created_at
            FROM services
            WHERE slug = ? AND status = 'active'
            LIMIT 1";
    $stmt = prepareAndExecute($conn, $sql, 's', [$slug]);
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        sendResponse(404, 'error', null, 'Service not found.');
    }

    $service = normalizeService($result->fetch_assoc());
    $stmt->close();
    sendResponse(200, 'success', $service);
}

function getCategories(mysqli $conn): void
{
    $sql = "SELECT category, COUNT(*) AS total
            FROM services
            WHERE status = 'active'
            GROUP BY category
            ORDER BY category ASC";
    $result = $conn->query($sql);

    if (!$result) {
        sendResponse(500, 'error', null, 'Unable to load categories.');
    }

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            'name' => $row['category'],
            'total' => (int)$row['total'],
        ];
    }

    sendResponse(200, 'success', $categories);
}

function prepareAndExecute(mysqli $conn, string $sql, string $types = '', array $params = []): mysqli_stmt
{
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        sendResponse(500, 'error', null, 'Database query could not be prepared.');
    }

    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        sendResponse(500, 'error', null, 'Database query failed.');
    }

    return $stmt;
}

function normalizeService(array $row): array
{
    if (array_key_exists('price', $row)) {
        $row['price'] = $row['price'] !== null ? (float)$row['price'] : null;
    }

    if (empty($row['image_url']) || str_contains((string)$row['image_url'], 'via.placeholder.com')) {
        $row['image_url'] = '/Task-11/api/service_image.php?title=' . rawurlencode((string)$row['title'])
            . '&category=' . rawurlencode((string)$row['category']);
    }

    if (empty($row['icon'])) {
        $row['icon'] = 'fa-solid fa-briefcase';
    } elseif (!str_contains($row['icon'], 'fa-')) {
        $row['icon'] = 'fa-solid fa-briefcase';
    } elseif (!str_contains($row['icon'], ' ')) {
        $row['icon'] = 'fa-solid ' . $row['icon'];
    }

    return $row;
}

function isValidText(string $value, int $maxLength): bool
{
    return strlen($value) <= $maxLength && preg_match('/^[\p{L}\p{N}\s\-_&.]+$/u', $value);
}

function isValidSearch(string $value, int $maxLength): bool
{
    return strlen($value) <= $maxLength && !preg_match('/[\x00-\x1F\x7F]/', $value);
}

function sendResponse(int $code, string $status, mixed $data = null, ?string $message = null, array $extra = []): never
{
    http_response_code($code);
    echo json_encode(array_merge([
        'status' => $status,
        'message' => $message,
        'data' => $data,
    ], $extra), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
