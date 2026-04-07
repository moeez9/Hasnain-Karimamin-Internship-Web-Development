<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

$search = normalizeText($_GET['search'] ?? '');
$selectedRole = normalizeText($_GET['role'] ?? '');
$members = [];
$roles = [];
$teamCount = 0;
$dbError = null;
$fallbackImage = resolveImageUrl(defaultProfileImage());

try {
    $roles = fetchRoles();
    $members = fetchTeamMembers([
        'search' => $search,
        'role' => $selectedRole,
    ]);
    $teamCount = countTeamMembers();
} catch (Throwable $exception) {
    $dbError = 'The team section is waiting for a MySQL connection. Import the SQL file in database/team_management.sql and update config/database.php.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us | NexaForge Studio</title>
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
<body class="page-about">
    <div class="site-shell">
        <header class="topbar container reveal">
            <a class="brand" href="<?= escape(route('about.php')) ?>">
                <span class="brand-mark">NF</span>
                <span>
                    <strong>NexaForge Studio</strong>
                    <small>Dynamic About Experience</small>
                </span>
            </a>
            <div class="topbar-actions">
                <a class="ghost-link" href="<?= escape(route('about.php#team')) ?>">Team</a>
                <a class="ghost-link" href="<?= escape(route('admin/index.php')) ?>">Admin Panel</a>
                <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">
                    <span data-theme-label>Dark mode</span>
                </button>
            </div>
        </header>

        <main>
            <section class="hero container reveal">
                <div class="hero-copy">
                    <p class="eyebrow">About NexaForge Studio</p>
                    <h1>We turn ideas into polished digital products that teams are proud to launch.</h1>
                    <p class="hero-subtitle">
                        NexaForge Studio is a product-focused agency that combines design, development, and delivery strategy
                        to help businesses ship thoughtful websites, dashboards, and branded digital experiences.
                    </p>
                    <div class="button-row">
                        <a class="button primary" href="#team">Meet the team</a>
                        <a class="button secondary" href="<?= escape(route('admin/index.php')) ?>">Manage team members</a>
                    </div>
                    <div class="hero-points">
                        <span>Mission: build useful products with empathy and speed.</span>
                        <span>Vision: become the most trusted execution partner for growing businesses.</span>
                        <span>Services: product strategy, UI/UX design, development, QA, and launch support.</span>
                    </div>
                </div>

                <div class="hero-panel">
                    <article class="glass-card">
                        <p class="eyebrow">Mission &amp; Vision</p>
                        <h2>Clarity in planning, quality in execution, and momentum after launch.</h2>
                        <p>
                            We help brands move from rough ideas to maintainable digital systems by aligning product thinking,
                            modern interfaces, and reliable engineering delivery.
                        </p>
                    </article>
                    <div class="stat-grid">
                        <article class="stat-card">
                            <strong><?= escape(str_pad((string) $teamCount, 2, '0', STR_PAD_LEFT)) ?></strong>
                            <span>Team specialists</span>
                        </article>
                        <article class="stat-card">
                            <strong>12+</strong>
                            <span>Active client products</span>
                        </article>
                        <article class="stat-card">
                            <strong>98%</strong>
                            <span>Client satisfaction target</span>
                        </article>
                        <article class="stat-card">
                            <strong>24/7</strong>
                            <span>Launch and support mindset</span>
                        </article>
                    </div>
                </div>
            </section>

            <section class="section container reveal">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">What We Do</p>
                        <h2>A balanced team built for product delivery</h2>
                    </div>
                    <p class="section-intro">
                        Our About page starts with static company storytelling and then hands off to live team data from MySQL,
                        making the content professional on the front end and manageable on the back end.
                    </p>
                </div>
                <div class="story-grid">
                    <article class="story-card">
                        <h3>Company Name</h3>
                        <p>NexaForge Studio</p>
                    </article>
                    <article class="story-card">
                        <h3>Mission</h3>
                        <p>Design and build clear, high-performing digital experiences that solve real business problems.</p>
                    </article>
                    <article class="story-card">
                        <h3>Vision</h3>
                        <p>Become the go-to creative technology partner for brands that want steady growth and elegant systems.</p>
                    </article>
                    <article class="story-card">
                        <h3>Services</h3>
                        <p>Brand storytelling, responsive front-end development, admin dashboards, API integration, and QA.</p>
                    </article>
                </div>
            </section>

            <section class="section container" id="team">
                <div class="section-heading reveal">
                    <div>
                        <p class="eyebrow">Our Team</p>
                        <h2>The people shaping every design review, sprint, and launch day.</h2>
                    </div>
                    <p class="section-intro">
                        Search by name, filter by role, and open each profile for a closer look at the people behind the work.
                    </p>
                </div>

                <form class="filter-bar reveal" method="get" action="<?= escape(route('about.php')) ?>">
                    <label class="field">
                        <span>Name Search</span>
                        <input type="search" name="search" value="<?= escape($search) ?>" placeholder="Search team member by name">
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
                        <button class="button primary" type="submit">Apply filters</button>
                        <a class="button subtle" href="<?= escape(route('about.php')) ?>">Reset</a>
                    </div>
                </form>

                <?php if ($dbError !== null): ?>
                    <div class="notice error reveal"><?= escape($dbError) ?></div>
                <?php else: ?>
                    <div class="results-meta reveal">
                        <p>
                            <?= escape(memberCountLabel(count($members))) ?>
                            <?= ($search !== '' || $selectedRole !== '') ? 'match the current search.' : 'are currently listed in the database.' ?>
                        </p>
                        <div class="role-pills">
                            <a class="role-pill <?= $selectedRole === '' ? 'active' : '' ?>" href="<?= escape(route('about.php')) ?>">All</a>
                            <?php foreach ($roles as $role): ?>
                                <?php
                                $query = ['role' => $role];
                                if ($search !== '') {
                                    $query['search'] = $search;
                                }
                                ?>
                                <a
                                    class="role-pill <?= $selectedRole === $role ? 'active' : '' ?>"
                                    href="<?= escape(route('about.php?' . http_build_query($query))) ?>"
                                >
                                    <?= escape($role) ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <?php if ($members === []): ?>
                        <div class="empty-state reveal">
                            <h3>No matching team members</h3>
                            <p>Try another name or role filter, or add a new member from the admin panel.</p>
                        </div>
                    <?php else: ?>
                        <div class="team-grid">
                            <?php foreach ($members as $member): ?>
                                <?php $memberImage = resolveImageUrl($member['profile_image'] ?? ''); ?>
                                <article class="team-card reveal">
                                    <div class="team-image-wrap">
                                        <img
                                            src="<?= escape($memberImage) ?>"
                                            alt="<?= escape((string) ($member['name'] ?? 'Team member')) ?>"
                                            loading="lazy"
                                            data-fallback="<?= escape($fallbackImage) ?>"
                                        >
                                        <div class="card-overlay">
                                            <div class="social-links">
                                                <?php if (!empty($member['linkedin_url'])): ?>
                                                    <a class="social-link" href="<?= escape((string) $member['linkedin_url']) ?>" target="_blank" rel="noreferrer">LinkedIn</a>
                                                <?php endif; ?>
                                                <?php if (!empty($member['github_url'])): ?>
                                                    <a class="social-link" href="<?= escape((string) $member['github_url']) ?>" target="_blank" rel="noreferrer">GitHub</a>
                                                <?php endif; ?>
                                            </div>
                                            <button
                                                type="button"
                                                class="details-button"
                                                data-modal-trigger
                                                data-name="<?= escape((string) ($member['name'] ?? '')) ?>"
                                                data-role="<?= escape((string) ($member['role'] ?? '')) ?>"
                                                data-bio="<?= escape((string) ($member['bio'] ?? '')) ?>"
                                                data-image="<?= escape($memberImage) ?>"
                                                data-linkedin="<?= escape((string) ($member['linkedin_url'] ?? '')) ?>"
                                                data-github="<?= escape((string) ($member['github_url'] ?? '')) ?>"
                                            >
                                                View profile
                                            </button>
                                        </div>
                                    </div>
                                    <div class="team-card-content">
                                        <div class="team-card-header">
                                            <h3><?= escape((string) ($member['name'] ?? '')) ?></h3>
                                            <span class="role-chip"><?= escape((string) ($member['role'] ?? '')) ?></span>
                                        </div>
                                        <p class="team-bio"><?= escape((string) ($member['bio'] ?? '')) ?></p>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
            </section>

            <section class="cta-banner container reveal">
                <div>
                    <p class="eyebrow">Want the roster to grow?</p>
                    <h2>Use the admin panel to keep the About page fresh as your team evolves.</h2>
                </div>
                <a class="button primary" href="<?= escape(route('admin/index.php')) ?>">Open admin panel</a>
            </section>
        </main>

        <footer class="site-footer container">
            <p>&copy; <?= escape((string) date('Y')) ?> NexaForge Studio. Built with PHP, MySQL, CSS, and JavaScript.</p>
        </footer>
    </div>

    <div class="modal" data-modal hidden>
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <button type="button" class="modal-close" data-modal-close aria-label="Close profile">&times;</button>
            <div class="modal-grid">
                <div class="modal-image-wrap">
                    <img src="<?= escape($fallbackImage) ?>" alt="" data-modal-image data-fallback="<?= escape($fallbackImage) ?>">
                </div>
                <div class="modal-body">
                    <p class="eyebrow">Team Profile</p>
                    <h3 id="profile-title" data-modal-name>Team member</h3>
                    <span class="role-chip" data-modal-role>Role</span>
                    <p data-modal-bio>Select a member to see their full profile details.</p>
                    <div class="modal-links">
                        <a class="social-link" href="#" target="_blank" rel="noreferrer" data-modal-linkedin hidden>LinkedIn</a>
                        <a class="social-link" href="#" target="_blank" rel="noreferrer" data-modal-github hidden>GitHub</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="<?= escape(route('assets/js/main.js')) ?>"></script>
</body>
</html>
