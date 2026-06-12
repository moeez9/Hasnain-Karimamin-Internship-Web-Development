<?php
declare(strict_types=1);

ob_start();
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

function sendJson(array $payload, int $statusCode = 200): void
{
    if (ob_get_length()) {
        ob_clean();
    }

    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

register_shutdown_function(function (): void {
    $error = error_get_last();
    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];

    if ($error && in_array($error['type'], $fatalTypes, true)) {
        if (ob_get_length()) {
            ob_clean();
        }

        sendJson([
            'items' => [],
            'page' => 1,
            'per_page' => 6,
            'total' => 0,
            'total_pages' => 0,
            'source' => 'database',
            'error' => 'A server error occurred while loading the gallery.',
        ]);
    }
});

try {
    require 'db.php';

    $category = isset($_GET['category']) ? trim((string)$_GET['category']) : '';
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 6;
    $offset = ($page - 1) * $limit;

    if (!$pdo) {
        sendJson([
            'items' => [],
            'page' => $page,
            'per_page' => $limit,
            'total' => 0,
            'total_pages' => 0,
            'source' => 'database',
            'error' => 'Database connection failed. Import gallery.sql and check db.php credentials.',
        ], 503);
    }

    $conditions = [];
    $params = [];

    if ($category !== '' && strtolower($category) !== 'all') {
        $conditions[] = 'LOWER(category) = LOWER(:category)';
        $params[':category'] = $category;
    }

    if ($search !== '') {
        $conditions[] = '(title LIKE :search_title OR description LIKE :search_description)';
        $params[':search_title'] = "%$search%";
        $params[':search_description'] = "%$search%";
    }

    $whereSql = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM gallery_items $whereSql");
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();

    $dataStmt = $pdo->prepare("SELECT * FROM gallery_items $whereSql ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
    foreach ($params as $key => $value) {
        $dataStmt->bindValue($key, $value);
    }
    $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $items = [];
    if ($dataStmt->execute()) {
        $items = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    sendJson([
        'items' => $items,
        'page' => $page,
        'per_page' => $limit,
        'total' => $total,
        'total_pages' => (int)ceil($total / $limit),
        'source' => 'database',
    ]);
} catch (Throwable $e) {
    sendJson([
        'items' => [],
        'page' => isset($page) ? $page : 1,
        'per_page' => isset($limit) ? $limit : 6,
        'total' => 0,
        'total_pages' => 0,
        'source' => 'database',
        'error' => 'Unable to load gallery data. Please check the database setup.',
    ], 500);
}

