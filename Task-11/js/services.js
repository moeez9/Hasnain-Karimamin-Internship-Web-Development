const API_BASE_URL = `${window.location.origin}/Task-11/api/services.php`;
const DETAILS_PAGE_URL = `${window.location.origin}/Task-11/services`;
const ITEMS_PER_PAGE = 8;
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_PREFIX = 'task11:v2:';

let currentPage = 1;
let currentCategory = '';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();

    if (document.getElementById('servicesGrid')) {
        loadCategories();
        loadServices();
    }
});

function initializeEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((event) => {
            searchQuery = event.target.value.trim();
            currentCategory = '';
            currentPage = 1;
            updateActiveFilter('');

            if (searchQuery.length === 1) {
                renderNotice('Type at least 2 characters to search.');
                return;
            }

            clearError();
            loadServices();
        }, 400));
    }
}

async function loadServices() {
    const params = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    if (currentCategory) {
        params.set('category', currentCategory);
    }

    if (searchQuery) {
        params.set('search', searchQuery);
    }

    try {
        setLoading(true);
        clearError();

        const result = await fetchJson(`${API_BASE_URL}?${params.toString()}`, `services:${params.toString()}`);

        if (result.status !== 'success') {
            throw new Error(result.message || 'Unable to load services.');
        }

        renderServices(result.data || []);
        renderPagination(result.pagination || null);
    } catch (error) {
        renderServices([]);
        showError(error.message || 'Services could not be loaded right now.');
    } finally {
        setLoading(false);
    }
}

async function loadCategories() {
    try {
        const result = await fetchJson(`${API_BASE_URL}?resource=categories`, 'services:categories');
        if (result.status === 'success') {
            renderCategoryFilters(result.data || []);
        }
    } catch (error) {
        showError('Category filters could not be loaded.');
    }
}

async function loadServiceDetail() {
    const slug = getRequestedSlug();

    if (!slug) {
        showError('No service selected.');
        return;
    }

    try {
        setLoading(true);
        clearError();

        const result = await fetchJson(`${API_BASE_URL}/${encodeURIComponent(slug)}`, `service:${slug}`);
        if (result.status !== 'success' || !result.data) {
            throw new Error(result.message || 'Service not found.');
        }

        renderServiceDetail(result.data);
        loadRelatedServices(result.data.category, result.data.id);
    } catch (error) {
        showError(error.message || 'Service details could not be loaded.');
    } finally {
        setLoading(false);
    }
}

async function loadRelatedServices(category, currentId) {
    if (!category) {
        return;
    }

    const params = new URLSearchParams({ category, limit: 4 });

    try {
        const result = await fetchJson(`${API_BASE_URL}?${params.toString()}`, `related:${category}`);
        const related = (result.data || [])
            .filter((service) => Number(service.id) !== Number(currentId))
            .slice(0, 3);

        renderRelatedServices(related);
    } catch (error) {
        renderRelatedServices([]);
    }
}

async function fetchJson(url, cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) {
        return cached;
    }

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result) {
        throw new Error(result?.message || `Request failed with status ${response.status}.`);
    }

    setCache(cacheKey, result);
    return result;
}

function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) {
        return;
    }

    if (!services.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <h3>No services found</h3>
                <p>Try another category or search term.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map((service) => `
        <article class="service-card">
            <a class="service-media" href="${DETAILS_PAGE_URL}/${encodeURIComponent(service.slug)}" aria-label="View ${escapeHtml(service.title)}">
                <img src="${escapeAttribute(localImageUrl(service))}" alt="${escapeAttribute(service.title)}" loading="lazy" onerror="this.src='${escapeAttribute(localImageUrl(service))}'">
                <span class="service-category">${escapeHtml(service.category)}</span>
                <span class="service-icon"><i class="${escapeAttribute(service.icon)}"></i></span>
            </a>
            <div class="service-content">
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.description)}</p>
                <div class="service-footer">
                    <strong>${formatPrice(service.price)}</strong>
                    <a class="btn btn-primary" href="${DETAILS_PAGE_URL}/${encodeURIComponent(service.slug)}">
                        View Details
                    </a>
                </div>
            </div>
        </article>
    `).join('');
}

function renderCategoryFilters(categories) {
    const container = document.getElementById('categoryFilters');
    if (!container) {
        return;
    }

    container.innerHTML = `
        <button class="filter-btn active" type="button" data-category="">
            <i class="fa-solid fa-layer-group"></i> All
        </button>
        ${categories.map((category) => `
            <button class="filter-btn" type="button" data-category="${escapeAttribute(category.name)}">
                <i class="${escapeAttribute(iconForCategory(category.name))}"></i>
                ${escapeHtml(category.name)}
            </button>
        `).join('')}
    `;

    container.querySelectorAll('.filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            currentCategory = button.dataset.category || '';
            searchQuery = '';
            currentPage = 1;

            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }

            updateActiveFilter(currentCategory);
            loadServices();
        });
    });
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container || !pagination || pagination.total_pages <= 1) {
        if (container) {
            container.innerHTML = '';
        }
        return;
    }

    const totalPages = Number(pagination.total_pages);
    const page = Number(pagination.current_page);
    const buttons = [];

    buttons.push(pageButton(page - 1, 'Previous', page === 1));

    for (let item = Math.max(1, page - 2); item <= Math.min(totalPages, page + 2); item += 1) {
        buttons.push(pageButton(item, String(item), false, item === page));
    }

    buttons.push(pageButton(page + 1, 'Next', page === totalPages));
    container.innerHTML = buttons.join('');

    container.querySelectorAll('button[data-page]').forEach((button) => {
        button.addEventListener('click', () => {
            currentPage = Number(button.dataset.page);
            loadServices();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function pageButton(page, label, disabled, active = false) {
    return `
        <button class="pagination-btn${active ? ' active' : ''}" type="button" data-page="${page}" ${disabled ? 'disabled' : ''}>
            ${label}
        </button>
    `;
}

function renderServiceDetail(service) {
    const container = document.getElementById('serviceDetails');
    if (!container) {
        return;
    }

    document.title = `${service.title} | Professional Services`;

    container.innerHTML = `
        <section class="details-hero">
            <img src="${escapeAttribute(localImageUrl(service))}" alt="${escapeAttribute(service.title)}" onerror="this.src='${escapeAttribute(localImageUrl(service))}'">
            <div>
                <span class="service-category">${escapeHtml(service.category)}</span>
                <h1>${escapeHtml(service.title)}</h1>
                <p>${escapeHtml(service.description)}</p>
                <div class="details-price">${formatPrice(service.price)}</div>
                <div class="details-actions">
                    <a class="btn btn-primary" href="mailto:contact@services.com?subject=${encodeURIComponent(`Order: ${service.title}`)}">
                        <i class="fa-solid fa-cart-shopping"></i> Order Now
                    </a>
                    <a class="btn btn-secondary" href="mailto:contact@services.com?subject=${encodeURIComponent(`Question about ${service.title}`)}">
                        <i class="fa-solid fa-envelope"></i> Contact
                    </a>
                </div>
            </div>
        </section>

        <section class="details-body">
            <h2>Service Details</h2>
            <p>${escapeHtml(service.details).replace(/\n/g, '<br>')}</p>
            <dl class="service-meta">
                <div><dt>Category</dt><dd>${escapeHtml(service.category)}</dd></div>
                <div><dt>Status</dt><dd>Active</dd></div>
                <div><dt>Created</dt><dd>${formatDate(service.created_at)}</dd></div>
            </dl>
        </section>
    `;
}

function renderRelatedServices(services) {
    const container = document.getElementById('relatedServices');
    if (!container || !services.length) {
        if (container) {
            container.innerHTML = '';
        }
        return;
    }

    container.innerHTML = `
        <section class="related-services">
            <h2>Related Services</h2>
            <div class="services-grid">
                ${services.map((service) => `
                    <article class="service-card">
                        <a class="service-media" href="${DETAILS_PAGE_URL}/${encodeURIComponent(service.slug)}">
                            <img src="${escapeAttribute(localImageUrl(service))}" alt="${escapeAttribute(service.title)}" loading="lazy" onerror="this.src='${escapeAttribute(localImageUrl(service))}'">
                            <span class="service-category">${escapeHtml(service.category)}</span>
                        </a>
                        <div class="service-content">
                            <h3>${escapeHtml(service.title)}</h3>
                            <p>${escapeHtml(service.description)}</p>
                            <div class="service-footer">
                                <strong>${formatPrice(service.price)}</strong>
                                <a class="btn btn-primary" href="${DETAILS_PAGE_URL}/${encodeURIComponent(service.slug)}">View Details</a>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function getRequestedSlug() {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('slug');
    if (querySlug) {
        return querySlug;
    }

    const parts = window.location.pathname.split('/').filter(Boolean);
    const servicesIndex = parts.indexOf('services');
    return servicesIndex >= 0 ? parts[servicesIndex + 1] : '';
}

function updateActiveFilter(category) {
    document.querySelectorAll('.filter-btn').forEach((button) => {
        button.classList.toggle('active', (button.dataset.category || '') === category);
    });
}

function iconForCategory(category) {
    const icons = {
        Web: 'fa-solid fa-globe',
        AI: 'fa-solid fa-brain',
        Mobile: 'fa-solid fa-mobile-screen-button',
        Cloud: 'fa-solid fa-cloud',
        Backend: 'fa-solid fa-server',
        Database: 'fa-solid fa-database',
        Design: 'fa-solid fa-pen-ruler',
    };

    return icons[category] || 'fa-solid fa-briefcase';
}

function localImageUrl(service) {
    const imageUrl = service?.image_url || '';
    if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
        return `/Task-11/api/service_image.php?title=${encodeURIComponent(service?.title || 'Service')}&category=${encodeURIComponent(service?.category || 'Services')}`;
    }

    return imageUrl;
}

function formatPrice(price) {
    if (price === null || price === undefined || price === '') {
        return 'Contact for price';
    }

    return `$${Number(price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function setLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.hidden = !show;
    }
}

function showError(message) {
    const error = document.getElementById('errorMessage');
    if (error) {
        error.textContent = message;
        error.hidden = false;
    }
}

function renderNotice(message) {
    const grid = document.getElementById('servicesGrid');
    const pagination = document.getElementById('pagination');

    setLoading(false);
    clearError();

    if (pagination) {
        pagination.innerHTML = '';
    }

    if (grid) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-keyboard"></i>
                <h3>Keep typing</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
}

function clearError() {
    const error = document.getElementById('errorMessage');
    if (error) {
        error.textContent = '';
        error.hidden = true;
    }
}

function getCache(key) {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) {
            return null;
        }

        const cached = JSON.parse(raw);
        if (Date.now() - cached.savedAt > CACHE_TTL) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }

        return cached.value;
    } catch (error) {
        return null;
    }
}

function setCache(key, value) {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ savedAt: Date.now(), value }));
    } catch (error) {
        sessionStorage.clear();
    }
}

function debounce(callback, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), wait);
    };
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}
