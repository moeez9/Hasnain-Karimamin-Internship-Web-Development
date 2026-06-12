# Dynamic Pricing Plans

This is a static pricing page that loads plan data dynamically from a local JSON file. It includes monthly/yearly billing, currency switching, loading/error handling, cached API response, responsive pricing cards, and a highlighted popular plan.

## Project Files

- `index.html` - Main page layout
- `styles.css` - Page styling and responsive design
- `script.js` - Fetch API integration and dynamic rendering
- `pricing.json` - Pricing plans data source

## Run Locally

Because this project uses `fetch()` to load `pricing.json`, open it through a local server instead of directly opening the HTML file.

### Option 1: Using Python

Open a terminal in the project folder and run:

```bash
python -m http.server 5500
```

Then open this URL in your browser:

```text
http://localhost:5500
```

### Option 2: Using VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right click `index.html`.
4. Click **Open with Live Server**.

## Deploy Live

This is a static website, so it can be deployed on Netlify, Vercel, GitHub Pages, or any normal hosting.

### Netlify

1. Go to `https://app.netlify.com/drop`.
2. Drag and drop the full project folder.
3. Netlify will generate a live website link.

### Vercel

1. Push the project to GitHub.
2. Go to `https://vercel.com/new`.
3. Import the GitHub repository.
4. Keep default settings and deploy.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to repository **Settings**.
3. Open **Pages**.
4. Select the branch, usually `main`.
5. Save and wait for the live link.

## How To Update Pricing Plans

Edit `pricing.json` and update the plan data:

```json
{
  "plan_name": "Growth",
  "billing_cycle": ["monthly", "yearly"],
  "most_popular": true,
  "price": {
    "monthly": { "USD": 49, "EUR": 44, "GBP": 39 },
    "yearly": { "USD": 490, "EUR": 440, "GBP": 390 }
  },
  "features": ["Unlimited projects", "Advanced reporting"]
}
```

After saving, refresh the browser. The pricing cards will update automatically from the JSON data.

## Notes

- Do not remove `pricing.json`; the page needs it to render plans.
- Keep `index.html`, `styles.css`, `script.js`, and `pricing.json` in the same folder.
- For live hosting, upload all project files together.
