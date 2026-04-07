# Dynamic Home Page with Hero Slider

This project is a modern portfolio-style landing page built with HTML, CSS, JavaScript, and jQuery. It includes a full-width animated hero slider for featured projects and services, manual navigation controls, responsive layout behavior, and accessibility-focused interaction.

## Features

- Full-width hero slider with auto-rotation every 5 seconds
- Previous/next navigation arrows
- Slide indicators/dots
- Dynamic slide generation from `data.json`
- Responsive layout for desktop, tablet, and mobile
- Smooth fade transition with subtle image zoom effect
- CTA button hover effects
- Keyboard navigation with left/right arrow keys
- Semantic HTML5 structure
- Accessible slide images with `alt` text

## Files

- `index.html` - Main page structure
- `styles.css` - Visual styling, layout, responsiveness, animations
- `script.js` - Slider logic and dynamic rendering
- `data.json` - Slide content source

## Important Note

If you open `index.html` directly with a `file://` path, browsers may block AJAX access to `data.json`. The script now falls back to demo slides in that case.

To test JSON loading properly, run a local server:

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/index.html
```

## Task Requirement Check

- Hero section with full-width animated slider: Implemented
- Slide image, title, description, CTA: Implemented
- Auto rotation every 4 to 5 seconds: Implemented at 5 seconds
- Previous/next arrows: Implemented
- Dots/indicators: Implemented
- Responsive design: Implemented
- Smooth animation effects: Implemented
- Dynamic content using JSON: Implemented
- Semantic HTML and keyboard accessibility: Implemented

## Last Updated

April 7, 2026
