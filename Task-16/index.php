<?php
$categories = [
    ['value' => 'all', 'label' => 'All'],
    ['value' => 'Web Design', 'label' => 'Web Design'],
    ['value' => 'Mobile Apps', 'label' => 'Mobile Apps'],
    ['value' => 'AI Projects', 'label' => 'AI Projects'],
    ['value' => 'Python Projects', 'label' => 'Python Projects'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task 16 Gallery</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header class="site-header">
        <a class="brand" href="index.php" aria-label="Task 16 Gallery home">
            <span class="brand-mark"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span>
            <span>Task 16 Gallery</span>
        </a>
        <div class="header-meta">
            <i class="fa-solid fa-database" aria-hidden="true"></i>
            <span>MySQL powered</span>
        </div>
    </header>

    <section class="hero">
        <div class="hero-copy">
            <p class="eyebrow">Backend Portfolio Gallery</p>
            <h1>Gallery project showcase with fast filtering.</h1>
            <p>Browse the gallery items stored in MySQL, search across project details, and open each work sample in a polished lightbox.</p>
        </div>
        <div class="hero-stats" aria-label="Gallery highlights">
            <div>
                <strong>08</strong>
                <span>Projects</span>
            </div>
            <div>
                <strong>04</strong>
                <span>Categories</span>
            </div>
            <div>
                <strong>Live</strong>
                <span>API</span>
            </div>
        </div>
    </section>

    <main class="main-content">
        <section class="controls-panel">
            <div class="search-wrapper">
                <label for="searchInput">Search gallery</label>
                <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
                <input id="searchInput" type="search" placeholder="Search by title or description" autocomplete="off">
            </div>
            <div class="filter-group" aria-label="Filter gallery by category">
                <?php foreach ($categories as $category) : ?>
                    <button class="filter-button<?php echo $category['value'] === 'all' ? ' active' : ''; ?>" data-category="<?php echo htmlspecialchars($category['value']); ?>">
                        <i class="fa-solid <?php echo $category['value'] === 'all' ? 'fa-border-all' : 'fa-folder-open'; ?>" aria-hidden="true"></i>
                        <span><?php echo htmlspecialchars($category['label']); ?></span>
                    </button>
                <?php endforeach; ?>
            </div>
        </section>

        <section id="galleryGrid" class="gallery-grid" aria-live="polite"></section>
        <div id="emptyState" class="empty-state" hidden>
            <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
            <span>No matching images found.</span>
        </div>
        <div id="loader" class="loader" hidden>
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            <span>Loading gallery...</span>
        </div>
        <div id="sentinel" class="sentinel"></div>
    </main>

    <div id="modal" class="modal" inert>
        <div class="modal-backdrop" data-close></div>
        <div class="modal-dialog" role="dialog" aria-modal="true">
            <button class="modal-close" data-close aria-label="Close modal">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
            <img id="modalImage" alt="" class="modal-image">
            <div class="modal-info">
                <span id="modalCategory" class="modal-category"></span>
                <h2 id="modalTitle"></h2>
                <p id="modalDescription"></p>
            </div>
        </div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>
