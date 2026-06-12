const teamContainer = document.getElementById("teamContainer");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const clearFilters = document.getElementById("clearFilters");
const resultsMeta = document.getElementById("resultsMeta");
const profileModal = document.getElementById("profileModal");
const modalBody = document.getElementById("modalBody");
const closeModalButton = document.getElementById("closeModal");

let members = [];
let lastFocusedTrigger = null;

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createRoleOptions(data) {
    const roles = [...new Set(data.map((member) => member.role).filter(Boolean))].sort();

    roleFilter.innerHTML = '<option value="all">All Roles</option>';
    roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });
}

function updateMeta(count) {
    resultsMeta.textContent = `${count} team member${count === 1 ? "" : "s"} found`;
}

function renderMembers(data) {
    teamContainer.innerHTML = "";
    teamContainer.classList.toggle("single-result", data.length === 1);

    if (!data.length) {
        statusMessage.textContent = "No team members found for the current search or filter.";
        statusMessage.classList.remove("error", "hidden");
        updateMeta(0);
        return;
    }

    statusMessage.classList.add("hidden");
    updateMeta(data.length);

    data.forEach((member) => {
        const article = document.createElement("article");
        article.className = "card";
        article.innerHTML = `
            <div class="image-wrap">
                <img src="${escapeHtml(member.image_url)}" alt="${escapeHtml(member.name)}" loading="lazy">
            </div>
            <div class="card-content">
                <p class="role">${escapeHtml(member.role)}</p>
                <h2>${escapeHtml(member.name)}</h2>
                <p class="bio">${escapeHtml(member.bio)}</p>
                <div class="social-links">
                    ${member.social_links?.github ? `<a href="${escapeHtml(member.social_links.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
                    ${member.social_links?.linkedin ? `<a href="${escapeHtml(member.social_links.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
                </div>
                <button type="button" class="details-button" data-member-id="${escapeHtml(member.id)}">View Profile</button>
            </div>
        `;

        teamContainer.appendChild(article);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedRole = roleFilter.value;

    const filteredMembers = members.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm);
        const matchesRole = selectedRole === "all" || member.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    renderMembers(filteredMembers);
}

function openModal(memberId) {
    const member = members.find((item) => String(item.id) === String(memberId));
    if (!member) {
        return;
    }

    modalBody.innerHTML = `
        <div class="modal-profile">
            <div class="modal-image-wrap">
                <img src="${escapeHtml(member.image_url)}" alt="${escapeHtml(member.name)}" loading="lazy">
            </div>
            <div class="modal-copy">
                <p class="role">${escapeHtml(member.role)}</p>
                <h2 id="modalTitle">${escapeHtml(member.name)}</h2>
                <p class="bio">${escapeHtml(member.bio)}</p>
                <p class="profile-id">Member ID: ${escapeHtml(member.id)}</p>
                <div class="social-links">
                    ${member.social_links?.github ? `<a href="${escapeHtml(member.social_links.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
                    ${member.social_links?.linkedin ? `<a href="${escapeHtml(member.social_links.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
                </div>
            </div>
        </div>
    `;

    profileModal.classList.add("is-open");
    profileModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeModalButton.focus();
}

function closeModal() {
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
        lastFocusedTrigger.focus();
    } else {
        searchInput.focus();
    }

    profileModal.classList.remove("is-open");
    profileModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

async function loadMembers() {
    try {
        const response = await fetch("api.php");
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Unable to load team members.");
        }

        members = payload.members;
        createRoleOptions(members);
        applyFilters();
    } catch (error) {
        teamContainer.innerHTML = "";
        resultsMeta.textContent = "0 team members found";
        statusMessage.textContent = error.message;
        statusMessage.classList.add("error");
        statusMessage.classList.remove("hidden");
    }
}

searchInput.addEventListener("input", applyFilters);
roleFilter.addEventListener("change", applyFilters);
clearFilters.addEventListener("click", () => {
    searchInput.value = "";
    roleFilter.value = "all";
    applyFilters();
});

teamContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".details-button");
    if (!button) {
        return;
    }

    lastFocusedTrigger = button;
    openModal(button.dataset.memberId);
});

closeModalButton.addEventListener("click", closeModal);
profileModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && profileModal.classList.contains("is-open")) {
        closeModal();
    }
});

loadMembers();
