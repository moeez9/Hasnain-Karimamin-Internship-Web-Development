document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const aboutForm = document.getElementById('about-form');
    const alertBox = document.getElementById('alert-box');
    const updateBtn = document.getElementById('update-btn');
    const btnText = updateBtn.querySelector('.btn-text');
    const loader = updateBtn.querySelector('.loader');

    // Initialize Quill editor
    const quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['clean']
            ]
        }
    });

    // Check Auth Status
    checkAuth();

    function checkAuth() {
        fetch('../api/auth.php?action=check')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in) {
                    showDashboard();
                } else {
                    showLogin();
                }
            })
            .catch(err => console.error(err));
    }

    function showDashboard() {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        loadAboutData();
    }

    function showLogin() {
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
    }

    function showAlert(message, type = 'success') {
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;
        alertBox.style.display = 'block';
        setTimeout(() => alertBox.style.display = 'none', 3000);
    }

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');

        fetch('../api/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                errorMsg.textContent = '';
                showDashboard();
            } else {
                errorMsg.textContent = data.message;
            }
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        fetch('../api/auth.php?action=logout', { method: 'POST' })
            .then(() => showLogin());
    });

    // Load About Data
    function loadAboutData() {
        fetch('../about')
            .then(res => res.json())
            .then(response => {
                if (response.success && response.data) {
                    const data = response.data;
                    document.getElementById('company_name').value = data.company_name;
                    document.getElementById('mission').value = data.mission;
                    document.getElementById('vision').value = data.vision;
                    document.getElementById('image_url').value = data.image_url || '';
                    quill.root.innerHTML = data.description;

                    if (data.image_url) {
                        const preview = document.getElementById('current-image-preview');
                        const previewUrl = data.image_url.startsWith('http') ? data.image_url : `../${data.image_url}`;
                        preview.innerHTML = `<p>Current Image:</p><img src="${previewUrl}" alt="Cover">`;
                    }
                }
            });
    }

    // Update About Data
    aboutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state
        updateBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'block';

        const company_name = document.getElementById('company_name').value;
        const mission = document.getElementById('mission').value;
        const vision = document.getElementById('vision').value;
        const description = quill.root.innerHTML;
        const image_url = document.getElementById('image_url').value;
        const imageFile = document.getElementById('image').files[0];

        const payload = { company_name, mission, vision, description, image_url };

        const sendPutRequest = (finalPayload) => {
            fetch('../about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
            })
            .then(res => {
                if (!res.ok) throw new Error('Unauthorized or server error');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    showAlert(data.message, 'success');
                    loadAboutData(); // Reload to show new image if uploaded
                } else {
                    showAlert(data.message, 'error');
                }
            })
            .catch(err => {
                showAlert(err.message, 'error');
            })
            .finally(() => {
                // Hide loading state
                updateBtn.disabled = false;
                btnText.style.display = 'inline';
                loader.style.display = 'none';
            });
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                payload.image_base64 = event.target.result;
                sendPutRequest(payload);
            };
            reader.readAsDataURL(imageFile);
        } else {
            sendPutRequest(payload);
        }
    });
});
