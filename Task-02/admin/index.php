<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$flash = getFlash();
$oldInput = getOldInput();
$editId = filter_input(INPUT_GET, 'edit', FILTER_VALIDATE_INT);
$search = normalizeText($_GET['search'] ?? '');
$selectedRole = normalizeText($_GET['role'] ?? '');
$editMember = null;
$members = [];
$roles = [];
$dbError = null;
$fallbackImage = resolveImageUrl(defaultProfileImage());

try {
    if ($editId) {
        $editMember = findTeamMember($editId);

        if ($editMember === null && $flash === null) {
            $flash = [
                'type' => 'warning',
                'message' => 'The selected member was not found. You can create a new record instead.',
            ];
        }
    }

    $members = fetchTeamMembers([
        'search' => $search,
        'role' => $selectedRole,
    ]);
    $roles = fetchRoles();
} catch (Throwable $exception) {
    $dbError = 'Database connection failed. Import database/team_management.sql and update config/database.php before using the admin panel.';
}

$formData = mergeMemberFormData($editMember, $oldInput);
$isEditing = $formData['id'] !== '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel | NexaForge Studio</title>
    <link rel="stylesheet" href="<?= escape(route('assets/css/styles.css')) ?>">
    <script>
        (function () {
            var storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                document.documentElement.dataset.theme = storedTheme;
            }
        })();
    </script>
</head>
<body class="page-admin">
    <?php if ($flash !== null): ?>
        <div class="flash-popup flash-popup-<?= escape((string) $flash['type']) ?>" data-flash-popup role="status" aria-live="polite">
            <div class="flash-popup-card">
                <div class="flash-popup-content">
                    <strong><?= escape(ucfirst((string) $flash['type'])) ?></strong>
                    <p><?= escape((string) $flash['message']) ?></p>
                </div>
                <button type="button" class="flash-popup-close" data-flash-close aria-label="Close notification">&times;</button>
            </div>
        </div>
    <?php endif; ?>

    <div class="site-shell">
        <header class="topbar container reveal">
            <a class="brand" href="<?= escape(route('about.php')) ?>">
                <span class="brand-mark">NF</span>
                <span>
                    <strong>NexaForge Studio</strong>
                    <small>Team Management Panel</small>
                </span>
            </a>
            <div class="topbar-actions">
                <a class="ghost-link" href="<?= escape(route('about.php')) ?>">View About Page</a>
                <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">
                    <span data-theme-label>Dark mode</span>
                </button>
            </div>
        </header>

        <main class="container admin-layout">
            <section class="admin-panel reveal">
                <div class="panel-heading">
                    <p class="eyebrow">Admin Controls</p>
                    <h1><?= $isEditing ? 'Edit team member' : 'Add a new team member' ?></h1>
                    <p>Create, update, and organize the people shown on the public About page.</p>
                </div>


                <?php if ($dbError !== null): ?>
                    <div class="notice error"><?= escape($dbError) ?></div>
                <?php else: ?>
                    <form
                        class="admin-form"
                        action="<?= escape(route('admin/save_member.php')) ?>"
                        method="post"
                        enctype="multipart/form-data"
                    >
                        <input type="hidden" name="csrf_token" value="<?= escape(csrfToken()) ?>">
                        <input type="hidden" name="id" value="<?= escape((string) $formData['id']) ?>">

                        <label class="field">
                            <span>Name</span>
                            <input type="text" name="name" value="<?= escape((string) $formData['name']) ?>" required>
                        </label>

                        <label class="field">
                            <span>Role</span>
                            <input type="text" name="role" value="<?= escape((string) $formData['role']) ?>" placeholder="Developer, Designer, Manager..." required>
                        </label>

                        <label class="field">
                            <span>Image URL</span>
                            <input type="text" name="image_url" value="<?= escape((string) $formData['image_url']) ?>" placeholder="https://example.com/photo.jpg">
                        </label>

                        <label class="field">
                            <span>Or Upload Image</span>
                            <input type="file" name="image_file" accept=".jpg,.jpeg,.png,.gif,.webp,.svg,image/*" data-image-upload>
                        </label>

                        <div class="image-preview-card">
                            <img
                                src="<?= escape(resolveImageUrl((string) $formData['image_url'])) ?>"
                                alt="Team member preview"
                                data-image-preview
                                data-fallback="<?= escape($fallbackImage) ?>"
                            >
                            <p>Preview updates when you paste an image URL or choose a file upload.</p>
                        </div>

                        <label class="field">
                            <span>Short Bio</span>
                            <textarea name="bio" rows="5" required><?= escape((string) $formData['bio']) ?></textarea>
                        </label>

                        <label class="field">
                            <span>LinkedIn URL</span>
                            <input type="text" name="linkedin_url" value="<?= escape((string) $formData['linkedin_url']) ?>" placeholder="https://linkedin.com/in/username">
                        </label>

                        <label class="field">
                            <span>GitHub URL</span>
                            <input type="text" name="github_url" value="<?= escape((string) $formData['github_url']) ?>" placeholder="https://github.com/username">
                        </label>

                        <label class="field">
                            <span>Display Order</span>
                            <input type="number" name="display_order" value="<?= escape((string) $formData['display_order']) ?>" min="0" step="1">
                        </label>

                        <div class="button-row">
                            <button class="button primary" type="submit"><?= $isEditing ? 'Update member' : 'Add member' ?></button>
                            <a class="button subtle" href="<?= escape(route('admin/index.php')) ?>">Reset form</a>
                        </div>
                    </form>
                <?php endif; ?>
            </section>

            <section class="member-manager reveal">
                <div class="panel-heading">
                    <p class="eyebrow">Roster Overview</p>
                    <h2>Current team members</h2>
                    <p>Search by name, filter by role, and jump into edit or delete actions.</p>
                </div>

                <?php if ($dbError === null): ?>
                    <form class="filter-bar compact" method="get" action="<?= escape(route('admin/index.php')) ?>">
                        <label class="field">
                            <span>Name Search</span>
                            <input type="search" name="search" value="<?= escape($search) ?>" placeholder="Search by name">
                        </label>
                        <label class="field">
                            <span>Role Filter</span>
                            <select name="role">
                                <option value="">All roles</option>
                                <?php foreach ($roles as $role): ?>
                                    <option value="<?= escape($role) ?>" <?= $selectedRole === $role ? 'selected' : '' ?>>
                                        <?= escape($role) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </label>
                        <div class="filter-actions">
                            <button class="button primary" type="submit">Search</button>
                            <a class="button subtle" href="<?= escape(route('admin/index.php')) ?>">Reset</a>
                        </div>
                    </form>

                    <?php if ($members === []): ?>
                        <div class="empty-state">
                            <h3>No team members found</h3>
                            <p>Add a member with the form or adjust the search criteria.</p>
                        </div>
                    <?php else: ?>
                        <div class="admin-list">
                            <?php foreach ($members as $member): ?>
                                <article class="member-row">
                                    <div class="member-row-main">
                                        <img
                                            class="member-thumb"
                                            src="<?= escape(resolveImageUrl($member['profile_image'] ?? '')) ?>"
                                            alt="<?= escape((string) ($member['name'] ?? '')) ?>"
                                            loading="lazy"
                                            data-fallback="<?= escape($fallbackImage) ?>"
                                        >
                                        <div>
                                            <div class="member-row-header">
                                                <h3><?= escape((string) ($member['name'] ?? '')) ?></h3>
                                                <span class="role-chip"><?= escape((string) ($member['role'] ?? '')) ?></span>
                                            </div>
                                            <p class="member-snippet"><?= escape((string) ($member['bio'] ?? '')) ?></p>
                                        </div>
                                    </div>
                                    <div class="member-row-actions">
                                        <a class="button secondary small" href="<?= escape(route('admin/index.php?edit=' . (int) $member['id'])) ?>">Edit</a>
                                        <form method="post" action="<?= escape(route('admin/delete_member.php')) ?>" data-delete-form>
                                            <input type="hidden" name="csrf_token" value="<?= escape(csrfToken()) ?>">
                                            <input type="hidden" name="id" value="<?= escape((string) $member['id']) ?>">
                                            <button class="button danger small" type="submit">Delete</button>
                                        </form>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                <?php else: ?>
                    <div class="notice error"><?= escape($dbError) ?></div>
                <?php endif; ?>
            </section>
        </main>
    </div>

    <div class="confirm-modal" data-confirm-modal hidden>
        <div class="confirm-modal-backdrop" data-confirm-cancel></div>
        <div class="confirm-modal-panel" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
            <button type="button" class="confirm-modal-close" data-confirm-cancel aria-label="Close confirmation">&times;</button>
            <p class="eyebrow">Delete Team Member</p>
            <h3 id="delete-confirm-title">Are you sure you want to delete this team member?</h3>
            <p class="confirm-modal-text">
                This action will remove the member from the About page roster. You can add them again later if needed.
            </p>
            <div class="button-row">
                <button type="button" class="button danger" data-confirm-submit>Yes, delete</button>
                <button type="button" class="button subtle" data-confirm-cancel>Cancel</button>
            </div>
        </div>
    </div>

    <script src="<?= escape(route('assets/js/main.js')) ?>"></script>
</body>
</html>

