<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Team Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="page-shell">
        <section class="hero">
            <p class="eyebrow">PHP API + JSON + Fetch</p>
            <h1>Meet Our Team</h1>
            <p class="hero-copy">
                Team members are loaded dynamically from <code>team.json</code> through a PHP API endpoint and rendered on the page with JavaScript Fetch API.
            </p>
        </section>

        <section class="toolbar">
            <div class="controls">
                <label class="field">
                    <span>Search by name</span>
                    <input
                        type="text"
                        id="searchInput"
                        placeholder="e.g. Ali Khan"
                    >
                </label>

                <label class="field">
                    <span>Filter by role</span>
                    <select id="roleFilter">
                        <option value="all">All Roles</option>
                    </select>
                </label>

                <div class="actions">
                    <button type="button" id="clearFilters">Reset</button>
                    <p class="results-meta" id="resultsMeta">Loading team members...</p>
                </div>
            </div>
        </section>

        <section class="message" id="statusMessage">Loading team members...</section>
        <section class="team-grid" id="teamContainer" aria-live="polite"></section>
    </main>

    <div class="modal" id="profileModal" aria-hidden="true">
        <div class="modal-backdrop" data-close-modal></div>
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <button type="button" class="modal-close" id="closeModal" aria-label="Close profile">&times;</button>
            <div class="modal-body" id="modalBody"></div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
