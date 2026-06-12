# Dynamic Team Page

Dynamic Team Page built with `PHP`, `JSON`, `HTML`, `CSS`, and `JavaScript Fetch API`. Team members are not hardcoded in the UI. Instead, the frontend fetches data from a PHP API endpoint that reads from `team.json`.

## Features

- Dynamic team data from `team.json`
- PHP API endpoint via `api.php`
- Frontend rendering with `fetch()`
- Responsive card/grid layout
- Search by team member name
- Filter by role
- Hover effects and smooth animations
- Modal popup for profile details
- Lazy loading for images

## Project Structure

- `index.php`:
  Main frontend page
- `api.php`:
  PHP API endpoint that returns team data as JSON
- `team.json`:
  Team members data source
- `script.js`:
  Fetches and renders team members dynamically
- `style.css`:
  Styling, layout, animations, and responsiveness

## Requirements

- PHP installed locally
- Any local server that can run PHP

## How To Run Locally

### Option 1: PHP Built-in Server

1. Open terminal in the project folder.
2. Run:

```bash
php -S localhost:8000
```

3. Open this URL in your browser:

```text
http://localhost:8000/index.php
```

### Option 2: XAMPP / WAMP

1. Move the project folder into your server web root.
   For example:
   - XAMPP: `htdocs`
   - WAMP: `www`
2. Start `Apache`.
3. Open the project in your browser.

Example URL:

```text
http://localhost/Task-07/index.php
```

## How It Works

1. `api.php` reads data from `team.json`.
2. `api.php` returns JSON response.
3. `script.js` calls `fetch("api.php")`.
4. Team cards are created dynamically and shown in the UI.
5. Search, filter, and modal features work on the fetched data.

## Data Format

Each team member follows this structure:

```json
{
  "id": 1,
  "name": "Ali Khan",
  "role": "Frontend Developer",
  "image_url": "https://example.com/image.jpg",
  "bio": "Expert in React and UI design",
  "social_links": {
    "github": "https://github.com/example",
    "linkedin": "https://linkedin.com/in/example"
  }
}
```

## Notes

- Do not open the project directly with a plain file path like `file:///...` because `fetch()` should run through a PHP server.
- To add more team members, update `team.json`.
- If PHP is not installed, install PHP or use XAMPP/WAMP first.
