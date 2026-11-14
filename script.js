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
  document.dispatchEvent(new Event("themechange")); // tells the sky to change colour
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

// ---------- Email: copy the address (works even if no email app is set up) ----------
const emailLink = document.getElementById("email-link");
const toast = document.getElementById("toast");
const email = "maryabadawi@hotmail.com";

emailLink.addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(email);
    event.preventDefault();
    toast.innerHTML = `Copied ${email} ✓ <a href="mailto:${email}">Open email app</a>`;
  } catch (e) {
    // Copying not allowed: let the normal mailto link open the email app
  }
});

// ---------- Night sky ----------
// Random stars that twinkle, a few real constellations, and the odd shooting star.
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Real constellation shapes (positions roughly as they look in the sky, 0 to 1)
const constellations = [
  {
    name: "Orion",
    stars: [[0.45, 0], [0.15, 0.15], [0.75, 0.22], [0.38, 0.55], [0.47, 0.52], [0.56, 0.48], [0.25, 0.95], [0.85, 0.9]],
    lines: [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]],
  },
  {
    name: "Ursa Major",
    stars: [[0, 0.25], [0.18, 0.12], [0.32, 0.1], [0.47, 0.15], [0.5, 0.38], [0.82, 0.4], [0.8, 0.12]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 6], [6, 5], [5, 4], [4, 3]],
  },
  {
    name: "Cassiopeia",
    stars: [[0, 0.1], [0.25, 0.45], [0.5, 0.2], [0.72, 0.5], [1, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
];

// Wide screens: constellations go in the empty side margins, away from the text.
// Phones/small screens: anywhere, but fainter.
const CONTENT_WIDTH = 900;
let dim = 1;

let stars = [];
let placed = [];
let shooting = null;
let color = "255, 255, 255";
let strength = 1;
let width, height;

function readColours() {
  const css = getComputedStyle(document.body);
  color = css.getPropertyValue("--star").trim();
  strength = parseFloat(css.getPropertyValue("--star-alpha")) || 1;
}

const between = (a, b) => a + Math.random() * (b - a);

function makeSky() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // About one star per 6000 square pixels
  stars = Array.from({ length: Math.round((width * height) / 6000) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() < 0.9 ? between(0.4, 1) : between(1.1, 1.7),
    base: between(0.25, 0.8),
    speed: between(0.0005, 0.002),
    phase: Math.random() * Math.PI * 2,
  }));

  const margin = (width - CONTENT_WIDTH) / 2;
  const wide = margin >= 170;
  dim = wide ? 1 : 0.45;
  const size = wide ? Math.min(margin - 110, height * 0.22) : Math.min(width, height) * 0.25;
  const leftX = () => between(15, Math.max(15, margin - size - 95)); // 95 = room for the name label
  const rightX = () => width - margin + between(20, Math.max(20, margin - size - 30));

  // [x, y] top-left corner for Orion, Ursa Major, Cassiopeia
  const spots = wide
    ? [
        [rightX(), between(0.12, 0.25) * height],
        [Math.random() < 0.5 ? leftX() : rightX(), between(0.6, 0.75) * height],
        [leftX(), between(0.1, 0.25) * height],
      ]
    : [
        [between(0.55, 0.7) * width, between(0.15, 0.3) * height],
        [between(0.05, 0.2) * width, between(0.6, 0.72) * height],
        [between(0.25, 0.45) * width, between(0.05, 0.12) * height],
      ];

  placed = constellations.map((c, i) => {
    const [ox, oy] = spots[i];
    return { ...c, points: c.stars.map(([x, y]) => [ox + x * size, oy + y * size]) };
  });
}

function drawStar(x, y, r, alpha) {
  ctx.fillStyle = `rgba(${color}, ${alpha * strength})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function draw(time) {
  ctx.clearRect(0, 0, width, height);

  for (const s of stars) {
    const twinkle = calm ? 1 : 0.65 + 0.35 * Math.sin(time * s.speed + s.phase);
    drawStar(s.x, s.y, s.r, s.base * twinkle);
  }

  ctx.lineWidth = 1;
  ctx.font = "11px Inter, sans-serif";
  for (const c of placed) {
    ctx.strokeStyle = `rgba(${color}, ${0.22 * strength * dim})`;
    ctx.beginPath();
    for (const [a, b] of c.lines) {
      ctx.moveTo(...c.points[a]);
      ctx.lineTo(...c.points[b]);
    }
    ctx.stroke();
    for (const [x, y] of c.points) drawStar(x, y, 1.8, 0.85 * dim);
    const [lx, ly] = c.points[c.points.length - 1];
    ctx.fillStyle = `rgba(${color}, ${0.4 * strength * dim})`;
    ctx.fillText(c.name, lx + 8, ly + 14);
  }

  // A shooting star every 6-14 seconds
  if (!calm) {
    if (!shooting && Math.random() < 0.002) {
      shooting = { x: between(0.3, 1) * width, y: between(0, 0.4) * height, life: 0 };
    }
    if (shooting) {
      shooting.life += 1;
      const t = shooting.life / 50;
      const hx = shooting.x - t * 320;
      const hy = shooting.y + t * 160;
      const tail = ctx.createLinearGradient(hx, hy, hx + 90, hy - 45);
      tail.addColorStop(0, `rgba(${color}, ${(1 - t) * strength})`);
      tail.addColorStop(1, `rgba(${color}, 0)`);
      ctx.strokeStyle = tail;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 90, hy - 45);
      ctx.stroke();
      if (t >= 1) shooting = null;
    }
    requestAnimationFrame(draw);
  }
}

readColours();
makeSky();
requestAnimationFrame(draw);

document.addEventListener("themechange", () => {
  readColours();
  if (calm) draw(0);
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Phones resize a little when the address bar hides: ignore that so the stars don't jump
    if (window.innerWidth === width && Math.abs(window.innerHeight - height) < 150) return;
    makeSky();
    if (calm) draw(0);
  }, 200);
});
