const apiUrl = '../api/services.php';
const tableBody = document.querySelector('#services-table tbody');
const alerts = document.querySelector('#alerts');
const loadingIndicator = document.querySelector('#loading-indicator');
const paginationNode = document.querySelector('#pagination');
const modal = document.querySelector('#modal');
const confirmDialog = document.querySelector('#confirm-dialog');
const form = document.querySelector('#service-form');
const openAddBtn = document.querySelector('#open-add-btn');
const closeModalBtn = document.querySelector('#close-modal');
const cancelModalBtn = document.querySelector('#cancel-modal');
const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');
const confirmDeleteBtn = document.querySelector('#confirm-delete');
const cancelDeleteBtn = document.querySelector('#cancel-delete');
const saveBtn = document.querySelector('#save-btn');

let currentPage = 1;
let currentSearch = '';
let deleteId = null;

function showAlert(message, type = 'success') {
    alerts.innerHTML = `<div class="alert ${type}">${message}</div>`;
    setTimeout(() => { alerts.innerHTML = ''; }, 4000);
}

function setLoading(isLoading) {
    loadingIndicator.classList.toggle('hidden', !isLoading);
}

function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    button.dataset.originalHtml = button.dataset.originalHtml || button.innerHTML;
    button.innerHTML = isLoading
        ? `<i class="fa-solid fa-spinner fa-spin"></i><span>${text}</span>`
        : button.dataset.originalHtml;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[char]));
}

function showModal(title) {
    document.querySelector('#modal-title').textContent = title;
    modal.classList.remove('hidden');
}

function hideModal() {
    modal.classList.add('hidden');
    form.reset();
    document.querySelector('#service-id').value = '';
}

function openConfirmDialog(id) {
    deleteId = id;
    confirmDialog.classList.remove('hidden');
}

function closeConfirmDialog() {
    deleteId = null;
    confirmDialog.classList.add('hidden');
}

function setFormValues(service) {
    document.querySelector('#service-id').value = service.id;
    document.querySelector('#title').value = service.title;
    document.querySelector('#description').value = service.description;
    document.querySelector('#category').value = service.category;
    document.querySelector('#status').value = service.status;
    document.querySelector('#image').value = '';
}

function createRow(service) {
    const row = document.createElement('tr');
    const image = service.image_url
        ? `<img class="service-thumb" src="${escapeHtml(service.image_url)}" alt="${escapeHtml(service.title)}">`
        : '<div class="service-thumb placeholder"><i class="fa-regular fa-image"></i></div>';
    row.innerHTML = `
        <td>${escapeHtml(service.id)}</td>
        <td>${image}</td>
        <td class="strong">${escapeHtml(service.title)}</td>
        <td class="description-cell">${escapeHtml(service.description)}</td>
        <td>${escapeHtml(service.category)}</td>
        <td><span class="status-badge ${escapeHtml(service.status)}">${escapeHtml(service.status)}</span></td>
        <td>${new Date(service.created_at).toLocaleString()}</td>
        <td class="actions">
            <button class="icon-btn secondary" data-action="edit" data-id="${escapeHtml(service.id)}" title="Edit service" aria-label="Edit service"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="icon-btn danger" data-action="delete" data-id="${escapeHtml(service.id)}" title="Delete service" aria-label="Delete service"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
    return row;
}

async function fetchServices() {
    setLoading(true);
    try {
        const url = `${apiUrl}?page=${currentPage}&per_page=10&search=${encodeURIComponent(currentSearch)}`;
        const response = await fetch(url);
        const payload = await response.json();
        if (!payload.success) {
            showAlert(payload.message || 'Unable to load services.', 'error');
            return;
        }
        tableBody.innerHTML = '';
        if (payload.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No services found.</td></tr>';
        } else {
            payload.data.forEach(service => tableBody.appendChild(createRow(service)));
        }
        renderPagination(payload.meta);
    } catch (error) {
        showAlert('Network error while fetching services.', 'error');
    } finally {
        setLoading(false);
    }
}

function renderPagination(meta) {
    paginationNode.innerHTML = '';
    if (!meta.pages || meta.pages <= 1) return;
    for (let i = 1; i <= meta.pages; i += 1) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'btn secondary';
        if (i === meta.page) button.className = 'btn primary';
        button.addEventListener('click', () => {
            currentPage = i;
            fetchServices();
        });
        paginationNode.appendChild(button);
    }
}

async function fetchServiceById(id) {
    try {
        const response = await fetch(`${apiUrl}?id=${id}`);
        const payload = await response.json();
        if (!payload.success) {
            showAlert(payload.message || 'Could not find service.', 'error');
            return null;
        }
        return payload.data ?? null;
    } catch {
        showAlert('Network error while loading service.', 'error');
        return null;
    }
}

async function submitForm(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const serviceId = formData.get('id');
    const method = serviceId ? 'POST' : 'POST';
    if (serviceId) {
        formData.set('_method', 'PUT');
    }
    setButtonLoading(saveBtn, true, 'Saving...');
    try {
        const response = await fetch(apiUrl + (serviceId ? `?id=${serviceId}` : ''), {
            method,
            body: formData,
        });
        const payload = await response.json();
        if (!payload.success) {
            const message = payload.errors ? Object.values(payload.errors).join(' ') : payload.message || 'Unable to save service.';
            showAlert(message, 'error');
            return;
        }
        showAlert(payload.message, 'success');
        hideModal();
        fetchServices();
    } catch {
        showAlert('Network error while saving.', 'error');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

async function deleteService() {
    if (!deleteId) return;
    setButtonLoading(confirmDeleteBtn, true, 'Deleting...');
    try {
        const formData = new FormData();
        formData.set('_method', 'DELETE');
        const response = await fetch(`${apiUrl}?id=${deleteId}`, {
            method: 'POST',
            body: formData,
        });
        const payload = await response.json();
        if (!payload.success) {
            showAlert(payload.message || 'Unable to delete service.', 'error');
            return;
        }
        showAlert(payload.message, 'success');
        closeConfirmDialog();
        fetchServices();
    } catch {
        showAlert('Network error while deleting.', 'error');
    } finally {
        setButtonLoading(confirmDeleteBtn, false);
    }
}

async function handleTableClick(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'edit') {
        const service = await fetchServiceById(id);
        if (!service) return;
        setFormValues(service);
        showModal('Edit Service');
    }
    if (action === 'delete') {
        openConfirmDialog(id);
    }
}

openAddBtn.addEventListener('click', () => {
    form.reset();
    document.querySelector('#service-id').value = '';
    showModal('Add Service');
});
closeModalBtn.addEventListener('click', hideModal);
cancelModalBtn.addEventListener('click', hideModal);
searchBtn.addEventListener('click', () => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    fetchServices();
});
searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchBtn.click();
    }
});
form.addEventListener('submit', submitForm);
tableBody.addEventListener('click', handleTableClick);
confirmDeleteBtn.addEventListener('click', deleteService);
cancelDeleteBtn.addEventListener('click', closeConfirmDialog);
modal.addEventListener('click', event => {
    if (event.target === modal) hideModal();
});
confirmDialog.addEventListener('click', event => {
    if (event.target === confirmDialog) closeConfirmDialog();
});

fetchServices();
