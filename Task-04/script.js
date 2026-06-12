const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const root = document.documentElement;

// Read the saved theme from local storage.
function getSavedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    return null;
  }
}

// Default theme stays light unless the user already selected a saved theme.
function getPreferredTheme() {
  const savedTheme = getSavedTheme();

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "light";
}

// Update the toggle icon and accessibility state.
function syncToggle(theme) {
  const isDark = theme === "dark";

  themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Activate light mode" : "Activate dark mode");
  themeToggle.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
}

// Apply the selected theme and optionally save it for future visits.
function applyTheme(theme, persistTheme = false) {
  root.setAttribute("data-theme", theme);
  syncToggle(theme);

  if (persistTheme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      return;
    }
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = root.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme, true);
});

// Load the theme when the page starts.
applyTheme(getPreferredTheme());
