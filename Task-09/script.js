document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const teamGrid = document.getElementById('team-grid');
    const modal = document.getElementById('profile-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const prevBtn = document.getElementById('prev-profile');
    const nextBtn = document.getElementById('next-profile');
    const modalLoading = document.getElementById('modal-loading');
    const modalDetails = document.getElementById('modal-details');
    
    // Modal Content Elements
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalBio = document.getElementById('modal-bio');
    const modalSkills = document.getElementById('modal-skills');
    const modalSocials = document.getElementById('modal-socials');

    // State
    let teamData = [];
    let currentMemberIndex = -1;
    let lastFocusedElement = null;

    // Initialize
    async function init() {
        try {
            // In a real app, this would be an API endpoint
            // We simulate network delay for demonstration
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to fetch team data');
            
            teamData = await response.json();
            renderTeamGrid(teamData);
        } catch (error) {
            console.error('Error loading team data:', error);
            teamGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #f87171; margin-bottom: 1rem;"></i>
                    <h3>Error loading team data</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Render Team Grid
    function renderTeamGrid(data) {
        teamGrid.innerHTML = '';
        
        data.forEach((member, index) => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.dataset.index = index;
            card.tabIndex = 0; // Make focusable for accessibility
            
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${member.image}" alt="${member.name}" loading="lazy">
                </div>
                <h3>${member.name}</h3>
                <p class="role">${member.role}</p>
                <button class="view-btn">View Profile</button>
            `;
            
            // Event listeners for opening modal
            card.addEventListener('click', () => openModal(index));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(index);
                }
            });
            
            teamGrid.appendChild(card);
        });
    }

    // Open Modal
    function openModal(index) {
        if (index < 0 || index >= teamData.length) return;
        
        lastFocusedElement = document.activeElement;
        currentMemberIndex = index;
        
        // Show modal container
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        modal.setAttribute('aria-hidden', 'false');
        
        // Show loading state initially
        modalLoading.classList.remove('hidden');
        modalDetails.classList.add('hidden');
        
        // Simulate slight network delay for premium feel of loading data
        setTimeout(() => {
            populateModalData(teamData[currentMemberIndex]);
            modalLoading.classList.add('hidden');
            modalDetails.classList.remove('hidden');
        }, 400); // 400ms delay
    }

    // Close Modal
    function closeModal() {
        // Restore focus to prevent aria-hidden violation
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        } else if (document.activeElement) {
            document.activeElement.blur();
        }

        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        modal.setAttribute('aria-hidden', 'true');
        
        // Reset modal state
        setTimeout(() => {
            modalLoading.classList.remove('hidden');
            modalDetails.classList.add('hidden');
        }, 400); // Wait for transition to finish
    }

    // Populate Modal Data
    function populateModalData(member) {
        // Basic Info
        modalImg.src = member.image;
        modalImg.alt = member.name;
        modalName.textContent = member.name;
        modalRole.textContent = member.role;
        modalBio.textContent = member.bio;
        
        // Skills
        modalSkills.innerHTML = '';
        member.skills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.textContent = skill;
            modalSkills.appendChild(span);
        });
        
        // Social Links
        modalSocials.innerHTML = '';
        const socialIcons = {
            linkedin: 'fa-linkedin-in',
            github: 'fa-github',
            twitter: 'fa-twitter'
        };
        
        Object.entries(member.socialLinks).forEach(([platform, url]) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'social-icon';
            a.setAttribute('aria-label', platform);
            a.innerHTML = `<i class="fa-brands ${socialIcons[platform] || 'fa-link'}"></i>`;
            modalSocials.appendChild(a);
        });
        
        // Update navigation buttons visibility based on position
        prevBtn.style.opacity = currentMemberIndex > 0 ? '1' : '0.3';
        prevBtn.style.pointerEvents = currentMemberIndex > 0 ? 'auto' : 'none';
        
        nextBtn.style.opacity = currentMemberIndex < teamData.length - 1 ? '1' : '0.3';
        nextBtn.style.pointerEvents = currentMemberIndex < teamData.length - 1 ? 'auto' : 'none';
    }

    // Navigation functionality
    function navigateProfile(direction) {
        let newIndex = currentMemberIndex + direction;
        
        if (newIndex >= 0 && newIndex < teamData.length) {
            // Animate transition between profiles
            modalDetails.style.opacity = '0';
            modalDetails.style.transform = `translateX(${direction > 0 ? '20px' : '-20px'})`;
            
            setTimeout(() => {
                currentMemberIndex = newIndex;
                populateModalData(teamData[currentMemberIndex]);
                
                modalDetails.style.transition = 'none';
                modalDetails.style.transform = `translateX(${direction > 0 ? '-20px' : '20px'})`;
                
                // Force reflow
                void modalDetails.offsetWidth;
                
                modalDetails.style.transition = 'all 0.3s ease';
                modalDetails.style.opacity = '1';
                modalDetails.style.transform = 'translateX(0)';
            }, 200);
        }
    }

    // Event Listeners for Modal controls
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    prevBtn.addEventListener('click', () => navigateProfile(-1));
    nextBtn.addEventListener('click', () => navigateProfile(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            navigateProfile(-1);
        } else if (e.key === 'ArrowRight') {
            navigateProfile(1);
        }
    });

    // Start App
    init();
});
