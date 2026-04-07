<?php
declare(strict_types=1);

function startsWith(string $haystack, string $needle): bool
{
    return $needle === '' || strpos($haystack, $needle) === 0;
}

function endsWith(string $haystack, string $needle): bool
{
    if ($needle === '') {
        return true;
    }

    return substr($haystack, -strlen($needle)) === $needle;
}

function loadDatabaseConfig(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/../config/database.php';
    }

    return $config;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = loadDatabaseConfig();
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['database'],
        $config['charset']
    );

    $pdo = new PDO(
        $dsn,
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}

function baseUrl(): string
{
    static $baseUrl = null;

    if ($baseUrl !== null) {
        return $baseUrl;
    }

    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $directory = rtrim(str_replace('\\', '/', dirname($scriptName)), '/.');

    if ($directory !== '' && endsWith($directory, '/admin')) {
        $directory = substr($directory, 0, -6);
    }

    $baseUrl = $directory === '' ? '' : $directory;

    return $baseUrl;
}

function route(string $path = ''): string
{
    $base = baseUrl();
    $normalizedPath = ltrim($path, '/');

    if ($normalizedPath === '') {
        return $base !== '' ? $base : '/';
    }

    return ($base !== '' ? $base : '') . '/' . $normalizedPath;
}

function redirect(string $path): void
{
    header('Location: ' . route($path));
    exit;
}

function escape(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function normalizeText(?string $value): string
{
    return trim((string) $value);
}

function isAbsoluteUrl(string $value): bool
{
    return (bool) preg_match('#^(https?:)?//#i', $value) || startsWith($value, 'data:');
}

function normalizeUrl(?string $url): ?string
{
    $normalized = trim((string) $url);

    if ($normalized === '') {
        return null;
    }

    if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $normalized) && !startsWith($normalized, '//')) {
        $normalized = 'https://' . $normalized;
    }

    return $normalized;
}

function defaultProfileImage(): string
{
    return 'assets/images/team/default-avatar.svg';
}

function asset(string $path): string
{
    return isAbsoluteUrl($path) ? $path : route(ltrim($path, '/'));
}

function resolveImageUrl(?string $path): string
{
    $candidate = trim((string) $path);

    if ($candidate === '') {
        $candidate = defaultProfileImage();
    }

    return isAbsoluteUrl($candidate) ? $candidate : route(ltrim($candidate, '/'));
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function isValidCsrfToken(?string $token): bool
{
    $sessionToken = $_SESSION['csrf_token'] ?? '';

    return is_string($token) && $token !== '' && is_string($sessionToken) && hash_equals($sessionToken, $token);
}

function setFlash(string $type, string $message): void
{
    $_SESSION['flash_message'] = [
        'type' => $type,
        'message' => $message,
    ];
}

function getFlash(): ?array
{
    $flash = $_SESSION['flash_message'] ?? null;
    unset($_SESSION['flash_message']);

    return is_array($flash) ? $flash : null;
}

function rememberFormInput(array $input): void
{
    unset($input['csrf_token'], $input['image_file']);
    $_SESSION['old_input'] = $input;
}

function getOldInput(): array
{
    $oldInput = $_SESSION['old_input'] ?? [];
    unset($_SESSION['old_input']);

    return is_array($oldInput) ? $oldInput : [];
}

function clearOldInput(): void
{
    unset($_SESSION['old_input']);
}

function hasFileUpload(array $file): bool
{
    return isset($file['error']) && (int) $file['error'] !== UPLOAD_ERR_NO_FILE;
}

function fetchRoles(): array
{
    $statement = db()->query('SELECT DISTINCT role FROM team_members ORDER BY role ASC');
    $rows = $statement->fetchAll();
    $roles = [];

    foreach ($rows as $row) {
        $role = trim((string) ($row['role'] ?? ''));

        if ($role !== '') {
            $roles[] = $role;
        }
    }

    return $roles;
}

function countTeamMembers(): int
{
    return (int) db()->query('SELECT COUNT(*) FROM team_members')->fetchColumn();
}

function fetchTeamMembers(array $filters = []): array
{
    $sql = 'SELECT * FROM team_members WHERE 1 = 1';
    $params = [];

    if (!empty($filters['search'])) {
        $sql .= ' AND name LIKE :search';
        $params['search'] = '%' . trim((string) $filters['search']) . '%';
    }

    if (!empty($filters['role'])) {
        $sql .= ' AND role = :role';
        $params['role'] = trim((string) $filters['role']);
    }

    $sql .= ' ORDER BY display_order ASC, name ASC';

    $statement = db()->prepare($sql);
    $statement->execute($params);

    return $statement->fetchAll();
}

function findTeamMember(int $id): ?array
{
    $statement = db()->prepare('SELECT * FROM team_members WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $member = $statement->fetch();

    return $member ?: null;
}

function isLocalUpload(?string $path): bool
{
    $normalized = str_replace('\\', '/', trim((string) $path));

    return startsWith($normalized, 'uploads/team/');
}

function deleteLocalUpload(?string $path): void
{
    $normalized = str_replace('\\', '/', trim((string) $path));

    if ($normalized === '' || !isLocalUpload($normalized)) {
        return;
    }

    $uploadRoot = realpath(__DIR__ . '/../uploads/team');
    $absolutePath = __DIR__ . '/../' . ltrim($normalized, '/');
    $absoluteDirectory = realpath(dirname($absolutePath));

    if ($uploadRoot === false || $absoluteDirectory === false) {
        return;
    }

    $safeRoot = str_replace('\\', '/', $uploadRoot);
    $safeDirectory = str_replace('\\', '/', $absoluteDirectory);

    if (!startsWith($safeDirectory, $safeRoot)) {
        return;
    }

    if (is_file($absolutePath)) {
        @unlink($absolutePath);
    }
}

function saveUploadedImage(array $file): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Image upload failed. Please try again with a valid file.');
    }

    $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    if (!in_array($extension, $allowedExtensions, true)) {
        throw new RuntimeException('Allowed image formats are JPG, PNG, GIF, WEBP, and SVG.');
    }

    $size = (int) ($file['size'] ?? 0);

    if ($size > 5 * 1024 * 1024) {
        throw new RuntimeException('Please upload an image smaller than 5 MB.');
    }

    $temporaryPath = (string) ($file['tmp_name'] ?? '');

    if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
        throw new RuntimeException('The uploaded image could not be verified.');
    }

    $targetDirectory = __DIR__ . '/../uploads/team';

    if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0775, true) && !is_dir($targetDirectory)) {
        throw new RuntimeException('Unable to create the uploads directory.');
    }

    $filename = sprintf('team-%s-%s.%s', date('YmdHis'), bin2hex(random_bytes(3)), $extension);
    $targetPath = $targetDirectory . '/' . $filename;

    if (!move_uploaded_file($temporaryPath, $targetPath)) {
        throw new RuntimeException('Unable to move the uploaded image.');
    }

    return 'uploads/team/' . $filename;
}

function memberCountLabel(int $count): string
{
    return $count === 1 ? '1 team member' : $count . ' team members';
}

function mergeMemberFormData(?array $member, array $oldInput): array
{
    $defaults = [
        'id' => '',
        'name' => '',
        'role' => '',
        'image_url' => '',
        'bio' => '',
        'linkedin_url' => '',
        'github_url' => '',
        'display_order' => '0',
    ];

    $memberData = [
        'id' => isset($member['id']) ? (string) $member['id'] : '',
        'name' => isset($member['name']) ? (string) $member['name'] : '',
        'role' => isset($member['role']) ? (string) $member['role'] : '',
        'image_url' => isset($member['profile_image']) ? (string) $member['profile_image'] : '',
        'bio' => isset($member['bio']) ? (string) $member['bio'] : '',
        'linkedin_url' => isset($member['linkedin_url']) ? (string) $member['linkedin_url'] : '',
        'github_url' => isset($member['github_url']) ? (string) $member['github_url'] : '',
        'display_order' => isset($member['display_order']) ? (string) $member['display_order'] : '0',
    ];

    return array_merge($defaults, $memberData, $oldInput);
}
