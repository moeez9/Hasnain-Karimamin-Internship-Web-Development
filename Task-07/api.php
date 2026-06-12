<?php
header('Content-Type: application/json; charset=UTF-8');

$teamFile = __DIR__ . '/team.json';

if (!file_exists($teamFile)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Team data file not found.'
    ]);
    exit;
}

$json = file_get_contents($teamFile);
$members = json_decode($json, true);

if (!is_array($members)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid team data format.'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'members' => $members
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
