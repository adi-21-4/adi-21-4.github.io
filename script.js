(() => {
  const root = document.documentElement;
  const progress = document.getElementById("scroll-progress");
  const timeline = document.querySelector(".timeline");
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const year = document.getElementById("current-year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Keep the theme choice between visits, while still working if storage is blocked.
  try {
    const savedTheme = localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  } catch { /* Theme switching still works for this visit. */ }

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme === "light" ? "dark" : "light"} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "light" ? "#f3f1e9" : "#101411");
    try { localStorage.setItem("portfolio-theme", nextTheme); } catch { /* Optional preference. */ }
  });

  // Reveal content as it enters view. If the API is unavailable, content stays visible.
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -38px 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("in-view"));
  }

  // Mark the career stop currently passing through the reading line.
  const timelineItems = document.querySelectorAll(".timeline-item");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
    }, { rootMargin: "-44% 0px -44% 0px", threshold: 0 });
    timelineItems.forEach((item) => timelineObserver.observe(item));
  }

  // Project filters update both visibility and their accessible pressed state.
  const filters = document.querySelectorAll("[data-filter]");
  const projects = [...document.querySelectorAll("[data-project]")];
  const emptyState = document.getElementById("filter-empty");
  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      let shown = 0;
      filters.forEach((item) => {
        const active = item === filter;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projects.forEach((project) => {
        const visible = category === "all" || project.dataset.category === category;
        project.hidden = !visible;
        if (visible) shown += 1;
      });
      if (emptyState) emptyState.hidden = shown > 0;
    });
  });

  // Mobile navigation behaves like a small, keyboard-friendly disclosure.
  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mobileNav.hidden = true;
  };
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileNav.hidden = !open;
  });
  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.matchMedia("(min-width: 721px)").addEventListener?.("change", closeMenu);

  // Scroll progress is painted at most once per frame.
  let scrollPending = false;
  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    if (timeline && !reduceMotion.matches) {
      const bounds = timeline.getBoundingClientRect();
      const fillRange = Math.max(1, bounds.height - 36);
      const passed = window.innerHeight * 0.62 - (bounds.top + 8);
      const fill = Math.min(100, Math.max(0, (passed / fillRange) * 100));
      timeline.style.setProperty("--timeline-progress", `${fill}%`);
    }
    scrollPending = false;
  };
  window.addEventListener("scroll", () => {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(updateScrollProgress);
  }, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // Keep the copyright year current without hardcoding a stale date.
  if (year) year.textContent = String(new Date().getFullYear());

  // Subtle pointer parallax on the code card; off on touch or reduced-motion devices.
  const heroArt = document.getElementById("hero-art");
  const codeWindow = heroArt?.querySelector(".code-window");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (heroArt && codeWindow && finePointer.matches && !reduceMotion.matches) {
    heroArt.addEventListener("pointermove", (event) => {
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      codeWindow.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      codeWindow.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    });
    heroArt.addEventListener("pointerleave", () => {
      codeWindow.style.removeProperty("--tilt-x");
      codeWindow.style.removeProperty("--tilt-y");
    });
  }

  // Let the illustrated project covers catch the pointer with a soft highlight.
  if (finePointer.matches) {
    document.querySelectorAll(".project-visual").forEach((visual) => {
      visual.addEventListener("pointermove", (event) => {
        const bounds = visual.getBoundingClientRect();
        visual.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        visual.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      });
    });
  }
})();
