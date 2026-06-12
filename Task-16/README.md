# Dynamic Image Gallery (Backend Driven)

## Overview
A professional PHP gallery that loads project cards from a MySQL database. It supports:

- `GET /gallery` API endpoint
- category filtering
- search by title / description
- responsive masonry-style gallery
- modal/lightbox image view
- lazy loading images
- infinite scroll
- Font Awesome icons
- MySQL-backed gallery data

## Setup

1. Start XAMPP and enable Apache + MySQL.
2. Import `gallery.sql` into your MySQL server.
3. Open `http://localhost/Task-16/` in your browser.

## MySQL credentials

The app uses these defaults in `db.php`:

- host: `127.0.0.1`
- database: `task16_gallery`
- user: `root`
- password: empty

Update `db.php` if your environment uses different credentials.

## API

- `GET /gallery` returns paginated images.
- `GET /gallery?category=Web%20Design` filters by category.
- `GET /gallery?search=dashboard` searches titles and descriptions.
- `GET /gallery?page=2` loads the next page for infinite scroll.

## Notes

- `.htaccess` rewrites `/gallery` to `gallery.php`.
- If the database connection fails, `gallery.php` returns a JSON error so setup issues are visible.
