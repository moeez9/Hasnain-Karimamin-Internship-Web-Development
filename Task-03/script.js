const navToggle = document.querySelector(".nav-toggle");
const siteMenu = document.querySelector(".site-nav");

if (navToggle && siteMenu) {
  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.classList.remove("is-active");
    siteMenu.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    const nextState = !isExpanded;

    navToggle.setAttribute("aria-expanded", String(nextState));
    navToggle.classList.toggle("is-active", nextState);
    siteMenu.classList.toggle("is-open", nextState);
  });

  siteMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 980) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 980) {
      closeMenu();
    }
  });
}
