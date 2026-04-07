<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('admin/index.php');
}

if (!isValidCsrfToken($_POST['csrf_token'] ?? null)) {
    setFlash('error', 'Security check failed. Please try again.');
    redirect('admin/index.php');
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$name = normalizeText($_POST['name'] ?? '');
$role = normalizeText($_POST['role'] ?? '');
$imageUrl = normalizeText($_POST['image_url'] ?? '');
$bio = normalizeText($_POST['bio'] ?? '');
$linkedinUrl = normalizeUrl($_POST['linkedin_url'] ?? null);
$githubUrl = normalizeUrl($_POST['github_url'] ?? null);
$displayOrder = filter_input(INPUT_POST, 'display_order', FILTER_VALIDATE_INT);
$displayOrder = ($displayOrder === false || $displayOrder === null) ? 0 : $displayOrder;
$redirectPath = $id ? 'admin/index.php?edit=' . $id : 'admin/index.php';

rememberFormInput([
    'id' => $id ?: '',
    'name' => $name,
    'role' => $role,
    'image_url' => $imageUrl,
    'bio' => $bio,
    'linkedin_url' => $linkedinUrl ?? '',
    'github_url' => $githubUrl ?? '',
    'display_order' => (string) $displayOrder,
]);

$errors = [];

if ($name === '') {
    $errors[] = 'Name is required.';
}

if ($role === '') {
    $errors[] = 'Role is required.';
}

if ($bio === '') {
    $errors[] = 'Bio is required.';
}

try {
    $existingMember = $id ? findTeamMember((int) $id) : null;
} catch (Throwable $exception) {
    setFlash('error', 'Database connection failed. Please check your MySQL settings.');
    redirect('admin/index.php');
}

if ($id && $existingMember === null) {
    setFlash('error', 'The team member you tried to edit no longer exists.');
    redirect('admin/index.php');
}

$profileImage = $existingMember['profile_image'] ?? '';
$uploadedImagePath = null;

if (hasFileUpload($_FILES['image_file'] ?? [])) {
    try {
        $uploadedImagePath = saveUploadedImage($_FILES['image_file']);
        $profileImage = $uploadedImagePath;
    } catch (RuntimeException $exception) {
        $errors[] = $exception->getMessage();
    }
} elseif ($imageUrl !== '') {
    $profileImage = $imageUrl;
} elseif ($profileImage === '') {
    $profileImage = defaultProfileImage();
}

if ($errors !== []) {
    setFlash('error', implode(' ', $errors));
    redirect($redirectPath);
}

try {
    if ($existingMember !== null) {
        $statement = db()->prepare(
            'UPDATE team_members
             SET name = :name,
                 role = :role,
                 profile_image = :profile_image,
                 bio = :bio,
                 linkedin_url = :linkedin_url,
                 github_url = :github_url,
                 display_order = :display_order
             WHERE id = :id'
        );
        $statement->execute([
            'name' => $name,
            'role' => $role,
            'profile_image' => $profileImage,
            'bio' => $bio,
            'linkedin_url' => $linkedinUrl,
            'github_url' => $githubUrl,
            'display_order' => $displayOrder,
            'id' => $existingMember['id'],
        ]);

        if (
            isset($existingMember['profile_image']) &&
            (string) $existingMember['profile_image'] !== $profileImage &&
            isLocalUpload((string) $existingMember['profile_image']) &&
            ($uploadedImagePath !== null || $imageUrl !== '')
        ) {
            deleteLocalUpload((string) $existingMember['profile_image']);
        }

        clearOldInput();
        setFlash('success', 'Team member updated successfully.');
        redirect('admin/index.php?edit=' . (int) $existingMember['id']);
    }

    $statement = db()->prepare(
        'INSERT INTO team_members (name, role, profile_image, bio, linkedin_url, github_url, display_order)
         VALUES (:name, :role, :profile_image, :bio, :linkedin_url, :github_url, :display_order)'
    );
    $statement->execute([
        'name' => $name,
        'role' => $role,
        'profile_image' => $profileImage,
        'bio' => $bio,
        'linkedin_url' => $linkedinUrl,
        'github_url' => $githubUrl,
        'display_order' => $displayOrder,
    ]);

    clearOldInput();
    setFlash('success', 'New team member added successfully.');
    redirect('admin/index.php');
} catch (Throwable $exception) {
    if ($uploadedImagePath !== null) {
        deleteLocalUpload($uploadedImagePath);
    }

    setFlash('error', 'Unable to save the team member. Please confirm the database is ready and try again.');
    redirect($redirectPath);
}
