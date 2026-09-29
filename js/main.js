/* ==========================================================================
   Aqua-washers — Autowasstraat · Premium interactions
   Theme toggle, scroll states, staggered reveals, polished mobile nav
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 0. Theme: apply stored / system preference ASAP (inline pre-paint also runs) */
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("aqua-theme", t); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#071722" : "#f4f9fa");
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", t === "dark" ? "Schakel licht thema in" : "Schakel donker thema in");
    });
  }
  // If no inline script ran (or storage differs), reconcile once:
  try {
    var stored = localStorage.getItem("aqua-theme");
    if (!stored) {
      var sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.setAttribute("data-theme", sys);
    } else {
      root.setAttribute("data-theme", stored);
    }
  } catch (e) {}

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
  applyTheme(currentTheme());

  /* 1. Mobile menu — smooth height animation via .open + staggered CSS */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("open")) return;
      var inside = event.target.closest(".site-header");
      if (!inside) setMenu(false);
    });
  }

  /* 2. Active nav link */
  function fileOf(url) {
    var clean = (url || "").split("#")[0].split("?")[0].split("/").pop();
    return clean || "index.html";
  }
  var current = fileOf(window.location.pathname);
  // Team anchor counts as Leden on homepage
  var hash = window.location.hash || "";
  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    if (href.charAt(0) === "#") return; // pure in-page anchor (e.g. Leden on homepage)
    if (fileOf(href) === current) {
      // Don't mark Home active when on index#team via Leden link confusion — keep simple:
      link.classList.add("is-actief");
      link.setAttribute("aria-current", "page");
    }
  });
  if (current === "index.html" && hash === "#team") {
    document.querySelectorAll(".site-nav a").forEach(function (l) {
      l.classList.remove("is-actief");
      l.removeAttribute("aria-current");
      if ((l.getAttribute("href") || "").indexOf("#team") !== -1) {
        l.classList.add("is-actief");
        l.setAttribute("aria-current", "true");
      }
    });
  }

  /* 3. Footer year */
  document.querySelectorAll("[data-jaar]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* 4. Header scroll state + progress bar + back-to-top (rAF, passive) */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var toTop = document.querySelector(".back-to-top");
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (progress) progress.style.transform = "scaleX(" + p.toFixed(4) + ")";

    if (toTop) toTop.classList.toggle("is-visible", y > 640);
  }
  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      if (prefersReduced) { window.scrollTo(0, 0); return; }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* 5. Staggered reveals — GPU transform/opacity only */
  function staggerSiblings(scope) {
    // Assign incremental delay to direct .reveal siblings for intentional cascade
    var items = scope.querySelectorAll(":scope > .reveal");
    if (items.length > 1) {
      items.forEach(function (el, i) {
        el.style.setProperty("--reveal-delay", Math.min(i * 70, 350) + "ms");
      });
    }
  }
  document.querySelectorAll(".tijdlijn, .team-grid, .studenten-grid, .kaarten-grid, .fase-koppelingen, .stat-row, .was-producten").forEach(staggerSiblings);

  var reveals = document.querySelectorAll(".reveal, .reveal-child");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("zichtbaar"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("zichtbaar");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* 6. TOC active section highlight (fase pages) */
  var toc = document.querySelector(".inhoud-fase");
  var sections = document.querySelectorAll(".onderdeel[id]");
  if (toc && sections.length && "IntersectionObserver" in window && !prefersReduced) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove("is-actief"); });
            var a = links[entry.target.id];
            if (a) a.classList.add("is-actief");
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* 7. Gentle press feedback for cards linking somewhere */
  if (!prefersReduced) {
    document.querySelectorAll(".tijdlijn li, .team-kaart, .fase-koppelingen a").forEach(function (el) {
      el.addEventListener("pointerdown", function () { el.style.transform = "translateY(-1px) scale(0.99)"; });
      el.addEventListener("pointerup", function () { el.style.transform = ""; });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }
})();
