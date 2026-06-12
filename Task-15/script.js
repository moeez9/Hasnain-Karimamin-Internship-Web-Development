const pricingUrl = './pricing.json';
const pricingGrid = document.getElementById('pricing-grid');
const statusMessage = document.getElementById('status-message');
const billingButtons = document.querySelectorAll('.toggle-button');
const currencySwitcher = document.getElementById('currency-switcher');
let pricingData = [];
let activeBilling = 'monthly';
let activeCurrency = 'USD';

const currencySymbols = {
  USD: '$',
  EUR: '\u20ac',
  GBP: '\u00a3',
};

const escapeHtml = (value) => {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
};

const setStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff7f7f' : '#c6cbd9';
};

const renderPlans = () => {
  if (!Array.isArray(pricingData) || pricingData.length === 0) {
    setStatus('No plan data available.', true);
    return;
  }

  pricingGrid.innerHTML = '';

  pricingData.forEach((plan, index) => {
    const isPopular = plan.most_popular;
    const rentPrice = plan.price?.[activeBilling]?.[activeCurrency];
    const billingLabel = activeBilling === 'monthly' ? 'per month' : 'per year';

    const card = document.createElement('article');
    card.className = `plan-card ${isPopular ? 'popular' : ''} animate-in`;
    card.style.animationDelay = `${index * 80}ms`;

    card.innerHTML = `
      ${isPopular ? '<span class="badge">Most Popular</span>' : ''}
      <div>
        <h2 class="plan-title">${escapeHtml(plan.plan_name)}</h2>
        <p class="plan-price"><span class="currency">${currencySymbols[activeCurrency]}</span><span class="amount">${rentPrice}</span><small>${billingLabel}</small></p>
      </div>
      <ul class="features-list">
        ${plan.features.map(feature => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHtml(feature)}</span></li>`).join('')}
      </ul>
      <button class="cta-button">Get Started</button>
    `;

    pricingGrid.appendChild(card);
  });

  setStatus('');
};

const hydrateUI = () => {
  billingButtons.forEach((button) => {
    const cycle = button.dataset.cycle;
    button.classList.toggle('active', cycle === activeBilling);
  });
};

const saveCache = (data) => {
  try {
    sessionStorage.setItem('pricingCache', JSON.stringify(data));
    sessionStorage.setItem('pricingCacheTime', Date.now().toString());
  } catch (error) {
    console.warn('Cache write failed', error);
  }
};

const loadCache = () => {
  try {
    const cache = sessionStorage.getItem('pricingCache');
    const age = sessionStorage.getItem('pricingCacheTime');
    if (!cache || !age) return null;
    const ageMs = Date.now() - Number(age);
    if (ageMs > 1000 * 60 * 10) return null;
    return JSON.parse(cache);
  } catch (error) {
    return null;
  }
};

const fetchPricingData = async () => {
  const cached = loadCache();
  if (cached) {
    pricingData = cached;
    renderPlans();
    return;
  }

  setStatus('Fetching pricing plans...');

  try {
    const response = await fetch(pricingUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response.');
    }

    pricingData = data;
    saveCache(data);
    renderPlans();
  } catch (error) {
    setStatus('Unable to load pricing. Please try again later.', true);
    console.error('Pricing fetch failed', error);
  }
};

billingButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeBilling = button.dataset.cycle;
    hydrateUI();
    renderPlans();
  });
});

currencySwitcher.addEventListener('change', (event) => {
  activeCurrency = event.target.value;
  renderPlans();
});

window.addEventListener('load', () => {
  hydrateUI();
  fetchPricingData();
});
