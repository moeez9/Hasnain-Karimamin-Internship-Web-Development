(function () {
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navLinksContainer = document.getElementById("navLinks");
    const progressBar = document.getElementById("progressBar");
    const contactBtn = document.getElementById("contactBtn");

    function removeActiveClasses() {
        navLinks.forEach((link) => link.classList.remove("active"));
    }

    function setActiveLinkById(sectionId) {
        removeActiveClasses();
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
        }
    }

    function handleNavbarBackground() {
        if (window.scrollY > 24) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    function updateProgressIndicator() {
        if (!progressBar) {
            return;
        }

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    }

    function closeMobileMenu() {
        navLinksContainer.classList.remove("active-menu");
        hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    function toggleMobileMenu() {
        const isOpen = navLinksContainer.classList.toggle("active-menu");
        hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
    }

    function updateActiveLinkOnScroll() {
        let currentSection = sections[0]?.id || "home";
        const scrollPosition = window.scrollY + navbar.offsetHeight + 120;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.id;
            }
        });

        setActiveLinkById(currentSection);
        updateProgressIndicator();
        handleNavbarBackground();
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const targetId = link.getAttribute("href").slice(1);
            const targetSection = document.getElementById(targetId);

            if (!targetSection) {
                return;
            }

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            setActiveLinkById(targetId);

            if (history.pushState) {
                history.pushState(null, "", `#${targetId}`);
            } else {
                window.location.hash = targetId;
            }

            if (navLinksContainer.classList.contains("active-menu")) {
                closeMobileMenu();
            }
        });
    });

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleMobileMenu();
        });
    }

    document.addEventListener("click", (event) => {
        const clickedInsideNav = navLinksContainer.contains(event.target);
        const clickedHamburger = hamburgerBtn.contains(event.target);

        if (!clickedInsideNav && !clickedHamburger && navLinksContainer.classList.contains("active-menu")) {
            closeMobileMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navLinksContainer.classList.contains("active-menu")) {
            closeMobileMenu();
        }
    });

    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            window.alert("Thanks for reaching out. This is a demo contact action.");
        });
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveLinkOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveLinkOnScroll);
    window.addEventListener("load", updateActiveLinkOnScroll);
    window.addEventListener("hashchange", updateActiveLinkOnScroll);

    updateActiveLinkOnScroll();
})();
