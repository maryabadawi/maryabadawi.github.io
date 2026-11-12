// ---------- Dark mode ----------
const toggle = document.getElementById("theme-toggle");

// Read the saved choice (localStorage can fail in private windows, so use try/catch)
function getSavedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (e) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // Not saved, but the page still works
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  toggle.textContent = isDark ? "☀️" : "🌙";
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

// First visit: follow the device setting. After that: remember the visitor's choice.
const saved = getSavedTheme();
const deviceDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(saved || (deviceDark ? "dark" : "light"));

toggle.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  saveTheme(next);
});

// ---------- "Last updated" date ----------
// GitHub Pages tells the browser when the page was last changed
const updated = new Date(document.lastModified);
if (!isNaN(updated)) {
  document.getElementById("last-updated").textContent = updated.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
