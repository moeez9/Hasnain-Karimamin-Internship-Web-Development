<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('admin/index.php');
}

if (!isValidCsrfToken($_POST['csrf_token'] ?? null)) {
    setFlash('error', 'Security check failed. Please refresh the page and try again.');
    redirect('admin/index.php');
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    setFlash('error', 'A valid team member is required for deletion.');
    redirect('admin/index.php');
}

try {
    $member = findTeamMember((int) $id);

    if ($member === null) {
        setFlash('warning', 'That team member was already removed.');
        redirect('admin/index.php');
    }

    $statement = db()->prepare('DELETE FROM team_members WHERE id = :id');
    $statement->execute(['id' => $id]);

    if (!empty($member['profile_image']) && isLocalUpload((string) $member['profile_image'])) {
        deleteLocalUpload((string) $member['profile_image']);
    }

    setFlash('success', 'Team member deleted successfully.');
} catch (Throwable $exception) {
    setFlash('error', 'Unable to delete the team member right now. Please try again.');
}

redirect('admin/index.php');
