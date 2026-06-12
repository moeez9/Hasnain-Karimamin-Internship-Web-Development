const cards = document.querySelectorAll(".card");

function revealCard(card) {
    const index = Number(card.dataset.index || 0);
    card.style.setProperty("--delay", `${index * 0.1}s`);
    card.classList.add("is-visible");
}

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealCard(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    cards.forEach((card) => observer.observe(card));
} else {
    cards.forEach(revealCard);
}

cards.forEach((card) => {
    const button = card.querySelector(".card-button");
    const title = card.querySelector("h2").textContent;

    button.addEventListener("click", () => {
        showToast(`${title} details are ready to explore.`);
    });
});

function showToast(message) {
    const existingToast = document.querySelector(".toast");

    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 2700);
}
