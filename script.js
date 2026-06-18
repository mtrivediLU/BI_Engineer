(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("siteNav");
  const progress = document.getElementById("scrollProgress");
  const typedText = document.getElementById("typedText");
  const dialog = document.getElementById("imageDialog");
  const dialogImage = document.getElementById("dialogImage");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogClose = document.getElementById("dialogClose");
  const canvas = document.getElementById("heroCanvas");

  const phrases = [
    "Automated organizational metrics",
    "Tableau dashboards and scorecards",
    "Complex SQL and Python scripting",
    "Root cause analysis for leaders",
    "Data quality at Amazon scale"
  ];

  let typedIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function updateProgress() {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  function initNavigation() {
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLAnchorElement)) return;
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  function initReveals() {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function animateCount(element) {
    const end = Number(element.dataset.count || "0");
    const suffix = element.dataset.suffix || "";
    const decimals = Number(element.dataset.decimals || "0");
    const startTime = performance.now();
    const duration = 900;

    function frame(now) {
      const progressValue = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      const current = end * eased;
      element.textContent = `${current.toFixed(decimals)}${suffix}`;

      if (progressValue < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!counters.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      counters.forEach((counter) => {
        const decimals = Number(counter.dataset.decimals || "0");
        counter.textContent = `${Number(counter.dataset.count || "0").toFixed(decimals)}${counter.dataset.suffix || ""}`;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function typeNext() {
    if (!typedText || prefersReducedMotion.matches) return;

    const phrase = phrases[typedIndex];
    typedText.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(typeNext, 42);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      window.setTimeout(typeNext, 1200);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(typeNext, 24);
      return;
    }

    deleting = false;
    typedIndex = (typedIndex + 1) % phrases.length;
    window.setTimeout(typeNext, 180);
  }

  function initImageDialog() {
    if (!dialog || !dialogImage || !dialogTitle) return;

    document.querySelectorAll("[data-full-image]").forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.getAttribute("data-full-image");
        const title = button.getAttribute("data-title") || "Preview";
        if (!src) return;

        dialogImage.src = src;
        dialogImage.alt = title;
        dialogTitle.textContent = title;

        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          window.open(src, "_blank", "noopener");
        }
      });
    });

    if (dialogClose) {
      dialogClose.addEventListener("click", () => dialog.close());
    }

    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (clickedOutside) {
        dialog.close();
      }
    });
  }

  function initCanvas() {
    if (!canvas || prefersReducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let points = [];
    let animationId = 0;
    const pointer = { x: 0, y: 0, active: false };

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.max(42, Math.min(105, Math.floor(width / 16)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        size: 1.2 + Math.random() * 2.4
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(245, 247, 249, 0.24)";
      context.fillRect(0, 0, width, height);

      points.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;
      });

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 150) continue;

          const opacity = (1 - distance / 150) * 0.16;
          context.strokeStyle = `rgba(19, 26, 34, ${opacity})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      if (pointer.active) {
        points.forEach((point) => {
          const dx = point.x - pointer.x;
          const dy = point.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 170) return;

          context.strokeStyle = `rgba(255, 153, 0, ${(1 - distance / 170) * 0.24})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        });
      }

      points.forEach((point, index) => {
        context.fillStyle = index % 7 === 0 ? "rgba(255, 153, 0, 0.5)" : "rgba(20, 110, 180, 0.34)";
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });

    canvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });

    window.addEventListener("resize", resize);
    resize();
    draw();

    prefersReducedMotion.addEventListener("change", () => {
      cancelAnimationFrame(animationId);
    });
  }

  function initActiveNav() {
    const links = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { threshold: 0.25, rootMargin: "-20% 0px -58% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  initNavigation();
  initReveals();
  initCounters();
  initImageDialog();
  initCanvas();
  initActiveNav();
  updateProgress();
  typeNext();

  window.addEventListener("scroll", updateProgress, { passive: true });
})();
