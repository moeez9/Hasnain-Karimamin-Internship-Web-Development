const teamData = [
    {
        id: 1,
        name: "Ali Khan",
        role: "Developer",
        skills: ["React", "JavaScript", "Node.js", "TypeScript"],
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 2,
        name: "Bilal Ahmed",
        role: "Designer",
        skills: ["UI/UX", "Figma", "Photoshop", "Illustrator"],
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 3,
        name: "Usman Tariq",
        role: "Manager",
        skills: ["Agile", "Scrum", "Leadership", "Communication"],
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 4,
        name: "Hamza Sheikh",
        role: "Developer",
        skills: ["Python", "Django", "SQL", "Docker"],
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 5,
        name: "Saad Mahmood",
        role: "Designer",
        skills: ["Illustration", "After Effects", "UI/UX", "Motion Graphics"],
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 6,
        name: "Omer Farooq",
        role: "Developer",
        skills: ["Java", "Spring Boot", "AWS", "Microservices"],
        image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 7,
        name: "Zeeshan Ali",
        role: "Manager",
        skills: ["Project Management", "Jira", "Strategy"],
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
        id: 8,
        name: "Fahad Mustafa",
        role: "Developer",
        skills: ["C#", ".NET", "Azure", "SQL Server"],
        image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
];

// Elements
const teamGrid = document.getElementById('teamGrid');
const searchInput = document.getElementById('searchInput');
const resetBtn = document.getElementById('resetBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');

// State
let currentSearch = '';
let currentCategory = 'All';

// Init
function init() {
    // Load state from local storage
    const savedSearch = localStorage.getItem('teamSearch');
    const savedCategory = localStorage.getItem('teamCategory');

    if (savedSearch) {
        currentSearch = savedSearch;
        searchInput.value = currentSearch;
        toggleResetBtn();
    }

    if (savedCategory) {
        currentCategory = savedCategory;
        updateActiveFilterBtn();
    }

    renderTeam();
    setupEventListeners();
}

// Render Team Cards
function renderTeam() {
    const filteredData = filterData();
    
    teamGrid.innerHTML = '';

    if (filteredData.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        
        filteredData.forEach((member, index) => {
            const delay = index * 0.05; // Staggered animation
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${delay}s`;

            // Highlight text if search exists
            const highlightedName = highlightText(member.name, currentSearch);
            const highlightedRole = highlightText(member.role, currentSearch);

            // Build skills HTML
            const skillsHtml = member.skills.map(skill => {
                return `<span class="skill-tag">${highlightText(skill, currentSearch)}</span>`;
            }).join('');

            card.innerHTML = `
                <img src="${member.image}" alt="${member.name}" class="card-img" loading="lazy">
                <h3 class="card-name">${highlightedName}</h3>
                <div class="card-role">${highlightedRole}</div>
                <div class="card-skills">
                    ${skillsHtml}
                </div>
            `;
            
            teamGrid.appendChild(card);
        });
    }
}

// Filter Logic
function filterData() {
    return teamData.filter(member => {
        // Category match
        const matchesCategory = currentCategory === 'All' || member.role === currentCategory;
        
        // Search match
        const searchLower = currentSearch.toLowerCase().trim();
        if (searchLower === '') return matchesCategory;

        const matchesName = member.name.toLowerCase().includes(searchLower);
        const matchesRole = member.role.toLowerCase().includes(searchLower);
        const matchesSkills = member.skills.some(skill => skill.toLowerCase().includes(searchLower));

        return matchesCategory && (matchesName || matchesRole || matchesSkills);
    });
}

// Utility: Highlight matching text
function highlightText(text, query) {
    if (!query.trim()) return text;
    
    // Escape regex special characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Debounce Utility
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Event Listeners
function setupEventListeners() {
    // Search input (debounced)
    const handleSearch = debounce((e) => {
        currentSearch = e.target.value;
        localStorage.setItem('teamSearch', currentSearch);
        toggleResetBtn();
        renderTeam();
    }, 300);

    searchInput.addEventListener('input', handleSearch);

    // Reset button
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        currentCategory = 'All';
        
        localStorage.removeItem('teamSearch');
        localStorage.setItem('teamCategory', currentCategory);
        
        updateActiveFilterBtn();
        toggleResetBtn();
        renderTeam();
    });

    // Category filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.role;
            localStorage.setItem('teamCategory', currentCategory);
            
            updateActiveFilterBtn();
            renderTeam();
        });
    });
}

// UI Updates
function toggleResetBtn() {
    resetBtn.style.display = currentSearch.length > 0 ? 'block' : 'none';
}

function updateActiveFilterBtn() {
    filterBtns.forEach(btn => {
        if (btn.dataset.role === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
