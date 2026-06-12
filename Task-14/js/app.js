const servicesContainer = document.querySelector('.services-container');

const fallbackServices = [
    {
        id: 'web-development',
        title: 'Web Development',
        icon: 'fa-solid fa-code',
        description: 'Build modern, responsive web applications tailored to your business needs. We create scalable and performant solutions using current frontend and backend practices.',
        features: [
            'Responsive design for all devices',
            'Fast loading and optimized performance',
            'SEO-friendly architecture',
            'Secure and maintainable code',
            'API integration and backend support',
        ],
    },
    {
        id: 'mobile-app-development',
        title: 'Mobile App Development',
        icon: 'fa-solid fa-mobile-screen-button',
        description: 'Develop native and cross-platform mobile apps that feel polished, reliable, and easy to use across iOS and Android.',
        features: [
            'Native iOS and Android development',
            'Cross-platform solutions with React Native',
            'User-friendly UI/UX design',
            'Push notifications and analytics',
            'App store optimization and deployment',
        ],
    },
    {
        id: 'ai-solutions',
        title: 'AI Solutions',
        icon: 'fa-solid fa-brain',
        description: 'Use artificial intelligence to automate processes, uncover insights, and create smarter customer and internal workflows.',
        features: [
            'Machine learning model development',
            'Natural language processing',
            'Computer vision applications',
            'Predictive analytics',
            'Custom AI chatbots and assistants',
        ],
    },
    {
        id: 'python-automation',
        title: 'Python Automation',
        icon: 'fa-brands fa-python',
        description: 'Streamline operations and remove repetitive manual work with dependable Python scripts, integrations, and workflow tools.',
        features: [
            'Business process automation',
            'Data scraping and processing',
            'Scheduled task automation',
            'Integration with existing systems',
            'Custom scripts and tools',
        ],
    },
];

let servicesData = [];
let activeIndex = 0;
let isMobile = window.matchMedia('(max-width: 768px)').matches;

async function loadServices() {
    if (window.location.protocol === 'file:') {
        servicesData = fallbackServices;
        activeIndex = getIndexFromHash();
        renderUI();
        return;
    }

    try {
        const response = await fetch('data/services.json');

        if (!response.ok) {
            throw new Error('Services file could not be loaded.');
        }

        servicesData = await response.json();
    } catch (error) {
        console.warn('Using fallback services:', error);
        servicesData = fallbackServices;
    }

    activeIndex = getIndexFromHash();
    renderUI();
}

function getIndexFromHash() {
    const hash = window.location.hash.replace('#', '');
    const index = servicesData.findIndex((service) => service.id === hash);

    return index >= 0 ? index : 0;
}

function setActiveIndex(index, updateHash = true) {
    activeIndex = Math.max(0, Math.min(index, servicesData.length - 1));

    if (updateHash) {
        history.replaceState(null, '', `#${servicesData[activeIndex].id}`);
    }
}

function serviceIcon(iconClass) {
    return `<span class="service-icon" aria-hidden="true"><i class="${iconClass}"></i></span>`;
}

function featureList(features, className) {
    return `
        <ul class="${className}">
            ${features.map((feature) => `<li>${feature}</li>`).join('')}
        </ul>
    `;
}

function serviceContent(service, mode) {
    return `
        <article class="service-card">
            <div class="service-heading">
                ${serviceIcon(service.icon)}
                <h3>${service.title}</h3>
            </div>
            <p class="service-description">${service.description}</p>
            ${featureList(service.features, mode === 'accordion' ? 'accordion-features' : 'service-features')}
        </article>
    `;
}

function renderUI() {
    isMobile = window.matchMedia('(max-width: 768px)').matches;
    servicesContainer.innerHTML = isMobile ? renderAccordion() : renderTabs();

    if (isMobile) {
        attachAccordionListeners();
        setAccordionHeights();
    } else {
        attachTabListeners();
        focusActivePanel();
    }
}

function renderTabs() {
    return `
        <div class="tabs-wrapper">
            <div class="tabs-header" role="tablist" aria-label="Services">
                ${servicesData.map((service, index) => `
                    <button
                        class="tab-button ${index === activeIndex ? 'active' : ''}"
                        type="button"
                        id="tab-${service.id}"
                        role="tab"
                        aria-selected="${index === activeIndex}"
                        aria-controls="panel-${service.id}"
                        tabindex="${index === activeIndex ? '0' : '-1'}"
                        data-index="${index}"
                    >
                        ${serviceIcon(service.icon)}
                        <span>${service.title}</span>
                    </button>
                `).join('')}
            </div>
            <div class="tabs-content">
                ${servicesData.map((service, index) => `
                    <div
                        class="tab-panel ${index === activeIndex ? 'active' : ''}"
                        id="panel-${service.id}"
                        role="tabpanel"
                        aria-labelledby="tab-${service.id}"
                        ${index === activeIndex ? '' : 'hidden'}
                    >
                        ${serviceContent(service, 'tabs')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function attachTabListeners() {
    const tabButtons = [...document.querySelectorAll('.tab-button')];

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => activateTab(Number(button.dataset.index), tabButtons));
        button.addEventListener('keydown', (event) => handleTabKeydown(event, tabButtons));
    });
}

function handleTabKeydown(event, tabButtons) {
    const currentIndex = tabButtons.findIndex((button) => button === document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabButtons.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    } else if (event.key === 'Home') {
        nextIndex = 0;
    } else if (event.key === 'End') {
        nextIndex = tabButtons.length - 1;
    } else {
        return;
    }

    event.preventDefault();
    activateTab(nextIndex, tabButtons);
    tabButtons[nextIndex].focus();
}

function activateTab(index, tabButtons) {
    const panels = [...document.querySelectorAll('.tab-panel')];

    setActiveIndex(index);

    tabButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === activeIndex;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', isActive);
        button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel, panelIndex) => {
        const isActive = panelIndex === activeIndex;
        panel.classList.toggle('active', isActive);
        panel.toggleAttribute('hidden', !isActive);
    });
}

function focusActivePanel() {
    const activePanel = document.querySelector('.tab-panel.active');

    if (activePanel) {
        activePanel.removeAttribute('hidden');
    }
}

function renderAccordion() {
    return `
        <div class="accordion-wrapper">
            ${servicesData.map((service, index) => `
                <div class="accordion-item">
                    <h3 class="accordion-title">
                        <button
                            class="accordion-header ${index === activeIndex ? 'active' : ''}"
                            type="button"
                            aria-expanded="${index === activeIndex}"
                            aria-controls="accordion-panel-${service.id}"
                            data-index="${index}"
                        >
                            <span class="accordion-label">
                                ${serviceIcon(service.icon)}
                                <span>${service.title}</span>
                            </span>
                            <span class="accordion-toggle" aria-hidden="true">
                                <i class="fa-solid fa-chevron-down"></i>
                            </span>
                        </button>
                    </h3>
                    <div
                        class="accordion-content ${index === activeIndex ? 'active' : ''}"
                        id="accordion-panel-${service.id}"
                    >
                        <div class="accordion-body">
                            ${serviceContent(service, 'accordion')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function attachAccordionListeners() {
    document.querySelectorAll('.accordion-header').forEach((header) => {
        header.addEventListener('click', () => activateAccordion(Number(header.dataset.index)));
    });
}

function activateAccordion(index) {
    const headers = [...document.querySelectorAll('.accordion-header')];
    const contents = [...document.querySelectorAll('.accordion-content')];
    const shouldClose = index === activeIndex && headers[index].classList.contains('active');

    headers.forEach((header, headerIndex) => {
        const isActive = !shouldClose && headerIndex === index;
        header.classList.toggle('active', isActive);
        header.setAttribute('aria-expanded', isActive);
    });

    contents.forEach((content, contentIndex) => {
        const isActive = !shouldClose && contentIndex === index;
        content.classList.toggle('active', isActive);
        content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
    });

    if (!shouldClose) {
        setActiveIndex(index);
    }
}

function setAccordionHeights() {
    document.querySelectorAll('.accordion-content').forEach((content) => {
        content.style.maxHeight = content.classList.contains('active') ? `${content.scrollHeight}px` : '0px';
    });
}

window.addEventListener('resize', () => {
    const newIsMobile = window.matchMedia('(max-width: 768px)').matches;

    if (newIsMobile !== isMobile) {
        renderUI();
        return;
    }

    if (newIsMobile) {
        setAccordionHeights();
    }
});

window.addEventListener('hashchange', () => {
    activeIndex = getIndexFromHash();
    renderUI();
});

document.addEventListener('DOMContentLoaded', loadServices);
