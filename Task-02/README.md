# Dynamic About Page with Team Management

A complete PHP + MySQL mini project for Task 2. It includes a public About page, a dynamic team section, and an admin panel for CRUD operations.

## Features

- Static company introduction with company name, mission, vision, and services
- Dynamic team member cards loaded from MySQL
- Admin panel to add, edit, and delete team members
- Image URL support plus optional local image upload
- Search by name and filter by role
- Responsive UI with hover effects, lazy-loaded images, modal profile details, scroll reveal, and dark/light mode

## Project Structure

- `about.php` public About page
- `admin/index.php` admin dashboard for managing team members
- `admin/save_member.php` create and update handler
- `admin/delete_member.php` delete handler
- `includes/functions.php` shared helpers and database access
- `assets/css/styles.css` complete styling
- `assets/js/main.js` interactions and progressive enhancements
- `database/team_management.sql` database schema and seed data

## Setup

1. Place the project inside your PHP server directory, such as `htdocs/Task-02` in XAMPP or `www/Task-02` in Laragon.
2. Create the MySQL database by importing `database/team_management.sql`.
3. Update the credentials in `config/database.php` if your local MySQL settings differ.
4. Make sure `uploads/team` is writable if you want to use image uploads.
5. Open `about.php` for the front-end page and `admin/index.php` for team management.

## Notes

- The seeded team members use local SVG profile images stored in `assets/images/team`.
- If the database is not connected yet, the pages show a friendly setup message instead of crashing.
- `index.php` redirects directly to the About page for convenience.
