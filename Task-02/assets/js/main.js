const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');

const preferredTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
}

applyTheme(preferredTheme || root.dataset.theme || systemTheme);

themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.16,
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

const imagesWithFallback = document.querySelectorAll('img[data-fallback]');

imagesWithFallback.forEach((image) => {
    image.addEventListener('error', () => {
        const fallback = image.dataset.fallback;
        if (fallback && image.src !== fallback) {
            image.src = fallback;
        }
    });
});

const modal = document.querySelector('[data-modal]');
const modalName = document.querySelector('[data-modal-name]');
const modalRole = document.querySelector('[data-modal-role]');
const modalBio = document.querySelector('[data-modal-bio]');
const modalImage = document.querySelector('[data-modal-image]');
const modalLinkedIn = document.querySelector('[data-modal-linkedin]');
const modalGitHub = document.querySelector('[data-modal-github]');

function updateModalLink(element, url) {
    if (!element) {
        return;
    }

    if (url) {
        element.href = url;
        element.hidden = false;
    } else {
        element.hidden = true;
        element.removeAttribute('href');
    }
}

function openModal(source) {
    if (!modal || !source) {
        return;
    }

    if (modalName) {
        modalName.textContent = source.dataset.name || 'Team member';
    }

    if (modalRole) {
        modalRole.textContent = source.dataset.role || 'Role';
    }

    if (modalBio) {
        modalBio.textContent = source.dataset.bio || 'Profile details are unavailable.';
    }

    if (modalImage) {
        modalImage.src = source.dataset.image || modalImage.dataset.fallback || '';
        modalImage.alt = source.dataset.name || 'Team member';
    }

    updateModalLink(modalLinkedIn, source.dataset.linkedin || '');
    updateModalLink(modalGitHub, source.dataset.github || '');

    modal.hidden = false;
    document.body.classList.add('modal-open');
}

function closeModal() {
    if (!modal) {
        return;
    }

    modal.hidden = true;
    document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-modal-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger));
});

modal?.addEventListener('click', (event) => {
    const closeTrigger = event.target instanceof Element ? event.target.closest('[data-modal-close]') : null;

    if (event.target === modal || closeTrigger) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

const imageUrlInput = document.querySelector('input[name="image_url"]');
const imageUploadInput = document.querySelector('[data-image-upload]');
const imagePreview = document.querySelector('[data-image-preview]');

imageUrlInput?.addEventListener('input', () => {
    if (!imagePreview) {
        return;
    }

    const fallback = imagePreview.dataset.fallback || '';
    const value = imageUrlInput.value.trim();
    imagePreview.src = value || fallback;
});

imageUploadInput?.addEventListener('change', () => {
    const selectedFile = imageUploadInput.files?.[0];

    if (!selectedFile || !imagePreview) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        imagePreview.src = String(event.target?.result || imagePreview.dataset.fallback || '');
    };
    reader.readAsDataURL(selectedFile);
});

const confirmModal = document.querySelector('[data-confirm-modal]');
const confirmSubmitButton = document.querySelector('[data-confirm-submit]');
let pendingDeleteForm = null;

function openConfirmModal(form) {
    if (!confirmModal) {
        return;
    }

    pendingDeleteForm = form;
    confirmModal.hidden = false;
    document.body.classList.add('modal-open');
}

function closeConfirmModal() {
    if (!confirmModal) {
        return;
    }

    confirmModal.hidden = true;
    pendingDeleteForm = null;
    document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-delete-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
        if (!confirmModal) {
            return;
        }

        event.preventDefault();
        openConfirmModal(form);
    });
});

confirmModal?.addEventListener('click', (event) => {
    const cancelTrigger = event.target instanceof Element ? event.target.closest('[data-confirm-cancel]') : null;

    if (cancelTrigger) {
        closeConfirmModal();
    }
});

confirmSubmitButton?.addEventListener('click', () => {
    if (!pendingDeleteForm) {
        closeConfirmModal();
        return;
    }

    const formToSubmit = pendingDeleteForm;
    closeConfirmModal();
    formToSubmit.submit();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && confirmModal && !confirmModal.hidden) {
        closeConfirmModal();
    }
});

const flashPopup = document.querySelector('[data-flash-popup]');
const flashCloseButton = document.querySelector('[data-flash-close]');

function dismissFlashPopup() {
    if (!flashPopup || flashPopup.classList.contains('is-hiding')) {
        return;
    }

    flashPopup.classList.add('is-hiding');

    window.setTimeout(() => {
        flashPopup.remove();
    }, 280);
}

flashCloseButton?.addEventListener('click', dismissFlashPopup);

if (flashPopup) {
    window.setTimeout(dismissFlashPopup, 4500);
}