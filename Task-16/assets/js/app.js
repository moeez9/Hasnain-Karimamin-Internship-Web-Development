const galleryGrid = document.getElementById('galleryGrid');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-button');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalCategory = document.getElementById('modalCategory');
const sentinel = document.getElementById('sentinel');

let currentPage = 1;
let totalPages = 1;
let activeCategory = 'all';
let searchTerm = '';
let loading = false;

const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        lazyObserver.unobserve(img);
    });
}, {
    rootMargin: '200px',
});

const sentinelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !loading && currentPage < totalPages) {
            currentPage += 1;
            fetchGalleryItems();
        }
    });
}, {
    rootMargin: '200px',
});

function setLoading(isLoading) {
    loading = isLoading;
    loader.hidden = !isLoading;
}

function buildUrl() {
    const params = new URLSearchParams();

    if (activeCategory && activeCategory !== 'all') {
        params.set('category', activeCategory);
    }

    if (searchTerm) {
        params.set('search', searchTerm);
    }

    params.set('page', currentPage);
    return `gallery.php?${params.toString()}`;
}

function createIcon(className) {
    const icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function renderItem(item) {
    const card = document.createElement('article');
    card.className = 'gallery-card';
    card.tabIndex = 0;

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'gallery-image-wrapper';

    const badge = document.createElement('span');
    badge.className = 'gallery-badge';
    badge.append(createIcon('fa-solid fa-tag'), document.createTextNode(item.category));

    const image = document.createElement('img');
    image.className = 'gallery-image';
    image.dataset.src = item.image_url;
    image.alt = item.title;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    imageWrapper.append(badge, image, overlay);

    const details = document.createElement('div');
    details.className = 'gallery-details';

    const title = document.createElement('h3');
    title.className = 'gallery-title';
    title.textContent = item.title;

    const description = document.createElement('p');
    description.className = 'gallery-description';
    description.textContent = item.description;

    details.append(title, description);
    card.append(imageWrapper, details);

    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal(item);
        }
    });

    lazyObserver.observe(image);
    return card;
}

function openModal(item) {
    modal.classList.add('open');
    modal.removeAttribute('inert');
    modalImage.src = item.image_url;
    modalImage.alt = item.title;
    modalCategory.textContent = item.category;
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
}

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('inert', '');
    modalImage.src = '';
}

function updateFilters() {
    filterButtons.forEach((button) => {
        const isActive = button.dataset.category === activeCategory;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function clearGallery() {
    galleryGrid.innerHTML = '';
    emptyState.hidden = true;
}

function showError(message) {
    galleryGrid.innerHTML = '';

    const error = document.createElement('p');
    error.className = 'empty-state';
    error.append(createIcon('fa-solid fa-circle-exclamation'), document.createTextNode(message));
    galleryGrid.appendChild(error);
}

async function parseJsonResponse(response) {
    const raw = await response.text();

    try {
        return JSON.parse(raw);
    } catch (error) {
        throw new Error('Gallery API returned an invalid response. Check gallery.php for PHP/database errors.');
    }
}

async function fetchGalleryItems() {
    setLoading(true);

    try {
        const response = await fetch(buildUrl());
        const data = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(data.error || `Failed to load gallery: ${response.status}`);
        }

        totalPages = data.total_pages || 1;

        if (currentPage === 1) {
            clearGallery();
            emptyState.hidden = data.total !== 0;
        }

        data.items.forEach((item) => {
            galleryGrid.appendChild(renderItem(item));
        });
    } catch (error) {
        console.error(error);

        if (currentPage === 1) {
            showError('Unable to load gallery. Please import gallery.sql and check the database connection.');
        }
    } finally {
        setLoading(false);
    }
}

function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

searchInput.addEventListener('input', debounce((event) => {
    searchTerm = event.target.value.trim();
    currentPage = 1;
    fetchGalleryItems();
}, 300));

filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
        activeCategory = button.dataset.category;
        updateFilters();
        currentPage = 1;
        fetchGalleryItems();
    });
});

modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]') || event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
    }
});

sentinelObserver.observe(sentinel);
window.addEventListener('load', fetchGalleryItems);
