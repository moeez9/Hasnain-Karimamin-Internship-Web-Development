document.addEventListener('DOMContentLoaded', () => {
    
    // Fetch About Data
    fetch('about')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                renderContent(data.data);
            } else {
                console.error('Failed to load data:', data.message);
                showErrorState();
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showErrorState();
        });

    function renderContent(data) {
        // Hide loader, show content
        document.getElementById('loader').style.display = 'none';
        document.getElementById('about-content').style.display = 'block';

        // Populate text
        document.getElementById('display-company-name').textContent = data.company_name;
        document.getElementById('display-description').innerHTML = data.description;
        document.getElementById('display-mission').textContent = data.mission;
        document.getElementById('display-vision').textContent = data.vision;

        // Populate Image if exists
        if (data.image_url) {
            const heroSection = document.getElementById('hero-section');
            // Adding timestamp to prevent caching issues if image is updated with same name
            heroSection.style.backgroundImage = `url('${data.image_url}?t=${new Date().getTime()}')`;
        }
    }

    function showErrorState() {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('about-content').style.display = 'block';
        
        document.getElementById('display-company-name').textContent = 'Content Unavailable';
        document.getElementById('display-description').innerHTML = '<p>We are currently unable to load our company information. Please try again later.</p>';
        document.getElementById('display-mission').textContent = 'Not available at the moment.';
        document.getElementById('display-vision').textContent = 'Not available at the moment.';
    }
});
