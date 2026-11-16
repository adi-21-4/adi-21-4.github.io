(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const progress = document.getElementById('scroll-progress');
  const resultCount = document.getElementById('results-count');
  const emptyState = document.getElementById('filter-empty');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('.project-card')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCategory = 'all';
  let themeAnimating = false;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    themeToggle?.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    const themeLabel = themeToggle?.querySelector('.theme-toggle-label');
    if (themeLabel) themeLabel.textContent = theme === 'light' ? 'Dark' : 'Light';
    themeToggle?.setAttribute('aria-pressed', String(theme === 'light'));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f2f3f5' : '#090b12');
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* The theme still works for this visit. */ }
  };
  try { const saved = localStorage.getItem('portfolio-theme'); if (saved === 'light' || saved === 'dark') applyTheme(saved); } catch { /* Storage is optional. */ }
  themeToggle?.addEventListener('click', () => {
    if (themeAnimating) return;
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const bounds = themeToggle.getBoundingClientRect();
    const originX = bounds.left + bounds.width / 2;
    const originY = bounds.top + bounds.height / 2;
    if (reduceMotion.matches) {
      applyTheme(nextTheme);
      return;
    }

    themeAnimating = true;
    const oldTheme = root.dataset.theme;
    const oldLayer = document.createElement('div');
    oldLayer.className = 'theme-old-layer';
    oldLayer.setAttribute('aria-hidden', 'true');
    const oldBodyStyle = getComputedStyle(document.body);
    oldLayer.style.backgroundColor = oldBodyStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? (oldTheme === 'dark' ? '#0b0f12' : '#f1f2ed') : oldBodyStyle.backgroundColor;
    oldLayer.style.backgroundImage = oldBodyStyle.backgroundImage;
    oldLayer.style.backgroundSize = '100% 100%';
    oldLayer.style.backgroundRepeat = 'no-repeat';
    oldLayer.style.colorScheme = oldTheme;
    const oldPage = document.createElement('div');
    oldPage.className = 'theme-old-page';
    const oldMain = document.querySelector('main')?.cloneNode(true);
    const oldFooter = document.querySelector('.site-footer')?.cloneNode(true);
    const originalNodes = [document.querySelector('main'), document.querySelector('.site-footer')]
      .filter(Boolean).flatMap((node) => [node, ...node.querySelectorAll('*')]);
    const clonedNodes = [oldMain, oldFooter].filter(Boolean)
      .flatMap((node) => [node, ...node.querySelectorAll('*')]);
    const themeProperties = [
      'color', 'background-color', 'background-image', 'border-top-color', 'border-right-color',
      'border-bottom-color', 'border-left-color', 'box-shadow', 'text-shadow', 'outline-color',
      'fill', 'stroke', 'opacity', 'visibility',
    ];
    clonedNodes.forEach((clone, index) => {
      const original = originalNodes[index];
      if (!original) return;
      const computed = getComputedStyle(original);
      themeProperties.forEach((property) => clone.style.setProperty(property, computed.getPropertyValue(property)));
      clone.style.setProperty('transition', 'none', 'important');
      clone.style.setProperty('animation', 'none', 'important');
    });
    if (oldMain) oldPage.append(oldMain);
    if (oldFooter) oldPage.append(oldFooter);
    oldPage.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
    oldPage.querySelectorAll('.scene-frame').forEach((frame) => { frame.style.background = 'transparent'; });
    oldLayer.append(oldPage);

    const svgNS = 'http://www.w3.org/2000/svg';
    const wipe = document.createElementNS(svgNS, 'svg');
    wipe.classList.add('theme-wipe');
    wipe.setAttribute('aria-hidden', 'true');
    wipe.setAttribute('preserveAspectRatio', 'none');
    const defs = document.createElementNS(svgNS, 'defs');
    const mask = document.createElementNS(svgNS, 'mask');
    const maskId = `theme-reveal-${Date.now()}`;
    mask.id = maskId;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('mask-type', 'luminance');
    const maskBackground = document.createElementNS(svgNS, 'rect');
    maskBackground.setAttribute('fill', 'white');
    const reveal = document.createElementNS(svgNS, 'path');
    reveal.setAttribute('fill', 'black');
    mask.append(maskBackground, reveal);
    defs.append(mask);
    const edgeGlow = document.createElementNS(svgNS, 'path');
    edgeGlow.classList.add('theme-wipe-edge-glow');
    const edge = document.createElementNS(svgNS, 'path');
    edge.classList.add('theme-wipe-edge');
    wipe.append(defs, edgeGlow, edge);
    oldLayer.style.mask = `url(#${maskId})`;
    oldLayer.style.webkitMask = `url(#${maskId})`;
    document.body.append(oldLayer, wipe);
    applyTheme(nextTheme);

    const duration = 3800;
    const arms = [
      { angle: 2.48, width: .075, reach: .2, phase: .3 },
      { angle: 2.92, width: .052, reach: .17, phase: 1.7 },
      { angle: 1.72, width: .061, reach: .15, phase: 2.8 },
      { angle: 3.62, width: .044, reach: .13, phase: 4.1 },
      { angle: 4.5, width: .052, reach: .12, phase: 5.2 },
    ];
    const smoothPath = (points) => {
      const n = points.length;
      let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
      for (let i = 0; i < n; i += 1) {
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
      }
      return `${d} Z`;
    };
    const start = performance.now();
    const crawl = (now) => {
      const width = innerWidth;
      const height = innerHeight;
      wipe.setAttribute('viewBox', `0 0 ${width} ${height}`);
      wipe.setAttribute('width', String(width));
      wipe.setAttribute('height', String(height));
      maskBackground.setAttribute('width', String(width));
      maskBackground.setAttribute('height', String(height));
      oldPage.style.transform = `translateY(-${scrollY}px)`;
      const t = Math.min(1, (now - start) / duration);
      const progress = t * t * (3 - 2 * t);
      const reach = Math.hypot(Math.max(originX, width - originX), Math.max(originY, height - originY)) * 1.22 * progress;
      const points = [];
      for (let i = 0; i < 180; i += 1) {
        const angle = (i / 180) * Math.PI * 2;
        let tendril = 0;
        arms.forEach((arm) => {
          const driftingAngle = arm.angle + Math.sin(t * 5 + arm.phase) * .035;
          const delta = Math.atan2(Math.sin(angle - driftingAngle), Math.cos(angle - driftingAngle));
          tendril += arm.reach * Math.exp(-((delta / arm.width) ** 2));
        });
        const ripple = .045 * Math.sin(angle * 7 + t * 5.2) + .027 * Math.sin(angle * 13 - t * 4.4 + .8) + .012 * Math.sin(angle * 23 + t * 2.3);
        const radius = Math.max(0, reach * (1 + ripple + tendril));
        points.push([originX + Math.cos(angle) * radius, originY + Math.sin(angle) * radius]);
      }
      const d = smoothPath(points);
      reveal.setAttribute('d', d);
      edgeGlow.setAttribute('d', d);
      edge.setAttribute('d', d);
      if (t < 1) requestAnimationFrame(crawl);
      else {
        oldLayer.remove();
        wipe.remove();
        themeAnimating = false;
      }
    };
    requestAnimationFrame(crawl);
  });

  const updateProjects = () => {
    let shown = 0;
    projects.forEach((card) => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const visible = matchesCategory;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (resultCount) resultCount.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}`;
    if (emptyState) emptyState.hidden = shown !== 0;
  };
  filters.forEach((button) => button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateProjects();
  }));
  const tickerTrack = document.querySelector('.ticker-track');
  const tickerGroup = tickerTrack?.querySelector('.ticker-group');
  if (tickerTrack && tickerGroup) {
    const sizeTickerCycle = () => {
      const width = tickerGroup.getBoundingClientRect().width;
      if (width > 0) tickerTrack.style.setProperty('--ticker-distance', `${width}px`);
    };
    sizeTickerCycle();
    const tickerObserver = new ResizeObserver(sizeTickerCycle);
    tickerObserver.observe(tickerGroup);
    document.fonts?.ready?.then(sizeTickerCycle);
  }

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
  };
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
  });
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener?.('change', closeMenu);

  const revealTargets = document.querySelectorAll('.section-heading,.project-card,.timeline-item,.education-card,.skill-group,.about-copy,.about-meta,.writing-card,.contact-inner');
  revealTargets.forEach((item) => item.setAttribute('data-reveal', ''));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach((item) => revealObserver.observe(item));
  } else revealTargets.forEach((item) => item.classList.add('is-visible'));

  let pending = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    pending = false;
  };
  addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
