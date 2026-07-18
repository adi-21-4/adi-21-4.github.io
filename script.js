/* ---------- scroll reveal ---------- */

const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("in-view"), i * 40);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ---------- active nav + sliding indicator ---------- */

const navLinks = document.querySelectorAll("[data-nav]");
const navIndicator = document.getElementById("nav-indicator");
const navList = document.getElementById("sidebar-nav");
const sections = Array.from(navLinks).map((link) =>
  document.querySelector(link.getAttribute("href"))
);

function moveIndicator(link) {
  if (!navIndicator || !navList || !link) return;
  const listRect = navList.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const offset = linkRect.top - listRect.top;
  navIndicator.style.transform = `translateY(${offset}px)`;
  navIndicator.style.height = `${linkRect.height}px`;
  navIndicator.classList.add("visible");
}

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`[data-nav][href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        moveIndicator(link);
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => section && navObserver.observe(section));

window.addEventListener("resize", () => {
  const active = document.querySelector("[data-nav].active");
  if (active) moveIndicator(active);
});

/* ---------- theme toggle ---------- */

const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const storedTheme = localStorage.getItem("theme");

if (storedTheme) root.setAttribute("data-theme", storedTheme);

themeToggle.addEventListener("click", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* ---------- scroll progress bar ---------- */

const progressBar = document.getElementById("progress-bar");

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

/* ---------- back to top ---------- */

const backToTop = document.getElementById("back-to-top");

function updateBackToTop() {
  backToTop.classList.toggle("visible", window.scrollY > 480);
}

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  updateProgress();
  updateBackToTop();
});

updateProgress();
updateBackToTop();

/* ---------- copy to clipboard ---------- */

const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1600);
}

function fallbackCopy(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showToast("Copied to clipboard");
  } catch {
    /* clipboard unavailable; mailto/tel link still works */
  }
  document.body.removeChild(textarea);
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", () => {
    const value = el.getAttribute("data-copy");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(value)
        .then(() => showToast("Copied to clipboard"))
        .catch(() => fallbackCopy(value));
    } else {
      fallbackCopy(value);
    }
  });
});

/* ---------- project card cursor glow ---------- */

document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});
