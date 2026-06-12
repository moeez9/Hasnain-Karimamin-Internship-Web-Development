<?php
session_start();
if (empty($_SESSION['is_admin'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Services Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header class="topbar">
        <div class="brand">Services Admin</div>
        <div class="topbar-actions">
            <button id="open-add-btn" class="btn secondary"><i class="fa-solid fa-plus"></i><span>Add Service</span></button>
            <a href="logout.php" class="btn danger"><i class="fa-solid fa-right-from-bracket"></i><span>Logout</span></a>
        </div>
    </header>

    <main class="container">
        <section class="panel">
            <div class="panel-header">
                <h2>Manage Services</h2>
                <div class="search-row">
                    <input id="search-input" type="search" placeholder="Search services...">
                    <button id="search-btn" class="btn primary"><i class="fa-solid fa-magnifying-glass"></i><span>Search</span></button>
                </div>
            </div>

            <div id="alerts"></div>
            <div class="table-actions">
                <div id="loading-indicator" class="loader hidden">Loading services...</div>
                <div id="pagination" class="pagination"></div>
            </div>
            <div class="table-wrapper">
                <table id="services-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    </main>

    <div id="modal" class="modal hidden">
        <div class="modal-content">
            <button id="close-modal" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            <h3 id="modal-title">Add Service</h3>
            <form id="service-form">
                <input type="hidden" name="id" id="service-id">
                <label>
                    Title
                    <input type="text" name="title" id="title" required>
                </label>
                <label>
                    Description
                    <textarea name="description" id="description" rows="4" required></textarea>
                </label>
                <label>
                    Category
                    <input type="text" name="category" id="category" required>
                </label>
                <label>
                    Status
                    <select name="status" id="status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>
                <label>
                    Image
                    <input type="file" name="image" id="image" accept="image/png, image/jpeg, image/gif">
                </label>
                <div class="form-row">
                    <button type="submit" class="btn primary" id="save-btn"><i class="fa-solid fa-floppy-disk"></i><span>Save</span></button>
                    <button type="button" id="cancel-modal" class="btn secondary"><i class="fa-solid fa-ban"></i><span>Cancel</span></button>
                </div>
            </form>
        </div>
    </div>

    <div id="confirm-dialog" class="modal hidden">
        <div class="modal-content small">
            <h3>Confirm Delete</h3>
            <p>Delete this service permanently?</p>
            <div class="form-row">
                <button id="confirm-delete" class="btn danger"><i class="fa-solid fa-trash"></i><span>Delete</span></button>
                <button id="cancel-delete" class="btn secondary"><i class="fa-solid fa-ban"></i><span>Cancel</span></button>
            </div>
        </div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>
