/* ==========================================================================
   Aqua-washers — Sectorproject Autowasstraat
   JavaScript: mobiel menu, actieve navigatielink, scroll-animaties, jaartal
   ========================================================================== */

(function () {
  "use strict";

  /* 1. Mobiel hamburgermenu */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* 2. Actieve navigatielink markeren op basis van huidige pagina */
  function bestandVanUrl() {
    var pad = window.location.pathname.split("/").pop();
    return pad || "index.html";
  }

  var huidigBestand = bestandVanUrl();
  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var bestandVanLink = href.split("#")[0];
    if (bestandVanLink === huidigBestand) {
      link.classList.add("is-actief");
    }
  });

  /* 3. Jaartal in de footer */
  document.querySelectorAll("[data-jaar]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* 4. Dark-mode wisselen */
  var themaKnop = document.querySelector(".dark-toggle");
  if (themaKnop) {
    themaKnop.addEventListener("click", function () {
      var nieuwThema =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nieuwThema;
      try {
        localStorage.setItem("thema", nieuwThema);
      } catch (e) {
        /* opslaan niet mogelijk (bv. privémodus) — geen probleem */
      }
    });
  }

  /* 5. Subtiele in-scroll-animatie */
  var revealElementen = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var waarnemer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("zichtbaar");
            waarnemer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealElementen.forEach(function (el) {
      waarnemer.observe(el);
    });
  } else {
    revealElementen.forEach(function (el) {
      el.classList.add("zichtbaar");
    });
  }
})();