let myBenefits = JSON.parse(localStorage.getItem('myBenefits')) || [];
let editingId = null; 

const storeDictionary = {
    "zara": "זארה", "זארה": "zara",
    "castro": "קסטרו", "קסטרו": "castro",
    "renuar": "רנואר", "רנואר": "renuar",
    "fox": "פוקס", "פוקס": "fox",
    "shufersal": "שופרסל", "שופרסל": "shufersal",
    "super-pharm": "סופר פארם", "סופר פארם": "super-pharm", "סופר-פארם": "super-pharm",
    "golf": "גולף", "גולף": "golf",
    "pull and bear": "פול אנד בר", "פול אנד בר": "pull and bear",
    "bershka": "ברשקה", "ברשקה": "bershka",
    "h&m": "אייץ' אנד אם", "אייץ אנד אם": "h&m",
    "april": "אפריל", "אפריל": "april",
    "steimatzky": "סטימצקי", "סטימצקי": "steimatzky",
    "tzomet sfarim": "צומת ספרים", "צומת ספרים": "tzomet sfarim",
    "mashbir": "המשביר", "המשביר": "mashbir",
    "shilav": "שילב", "שילב": "shilav",
    "terminal x": "טרמינל איקס", "טרמינל איקס": "terminal x",
    "nike": "נייקי", "נייקי": "nike",
    "adidas": "אדידס", "אדידס": "adidas",
    "mac": "מאק", "מאק": "mac",
    "ksp": "קיי אס פי", "קיי אס פי": "ksp"
};

const benefitForm = document.getElementById('benefitForm');
const benefitNameInput = document.getElementById('benefitNameInput');
const storesInput = document.getElementById('storesInput');
const typeInput = document.getElementById('typeInput');
const usageInput = document.getElementById('usageInput');
const detailsInput = document.getElementById('detailsInput');
const expiryInput = document.getElementById('expiryInput');
const submitBtn = document.getElementById('submitBtn');

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const alertsContainer = document.getElementById('alertsContainer'); 

function checkExpirations() {
    alertsContainer.innerHTML = ''; 
    const today = new Date();
    let alertsHtml = '';

    myBenefits.forEach(item => {
        if (item.expiry) {
            const parts = item.expiry.split(/[-/.]/);
            if (parts.length === 3) {
                let day = parseInt(parts[0], 10);
                let month = parseInt(parts[1], 10) - 1; 
                let year = parseInt(parts[2], 10);
                if (year < 100) year += 2000; 

                const expDate = new Date(year, month, day);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (diffDays < 0) {
                    alertsHtml += `<div class="alert-box expired">⚠️ פג תוקף! הכרטיס "${item.name || item.store}" פג לפני ${Math.abs(diffDays)} ימים.</div>`;
                } else if (diffDays <= 30) {
                    alertsHtml += `<div class="alert-box expiring">⏳ שימי לב! הכרטיס "${item.name || item.store}" עומד לפוג בעוד ${diffDays} ימים.</div>`;
                }
            }
        }
    });

    alertsContainer.innerHTML = alertsHtml;
}

benefitForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (editingId) {
        const index = myBenefits.findIndex(b => b.id === editingId);
        if (index !== -1) {
            myBenefits[index] = {
                ...myBenefits[index],
                name: benefitNameInput.value.trim(),
                stores: storesInput.value.trim(),
                type: typeInput.value === 'giftcard' ? 'גיפטקארד' : 'מועדון / ארגון',
                usage: usageInput.value,
                details: detailsInput.value.trim(),
                expiry: expiryInput.value.trim(),
                category: typeInput.value
            };
        }
        editingId = null;
        submitBtn.textContent = 'שמירה בארנק';
        submitBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)';
        alert('ההטבה עודכנה בהצלחה!');
    } else {
        const newBenefit = {
            id: Date.now(),
            name: benefitNameInput.value.trim(),
            stores: storesInput.value.trim(),
            type: typeInput.value === 'giftcard' ? 'גיפטקארד' : 'מועדון / ארגון',
            usage: usageInput.value,
            details: detailsInput.value.trim(),
            expiry: expiryInput.value.trim(),
            category: typeInput.value
        };
        myBenefits.push(newBenefit);
        alert('ההטבה נשמרה בהצלחה בארנק שלך!');
    }

    localStorage.setItem('myBenefits', JSON.stringify(myBenefits));
    benefitForm.reset();
    
    searchInput.dispatchEvent(new Event('input'));
    checkExpirations();
});

window.deleteBenefit = function(id) {
    if (confirm('בטוחה שאת רוצה למחוק את ההטבה הזו מהארנק?')) {
        myBenefits = myBenefits.filter(item => item.id !== id);
        localStorage.setItem('myBenefits', JSON.stringify(myBenefits));
        searchInput.dispatchEvent(new Event('input'));
        checkExpirations();
    }
};

window.editBenefit = function(id) {
    const item = myBenefits.find(b => b.id === id);
    if (!item) return;

    benefitNameInput.value = item.name || item.store || '';
    storesInput.value = item.stores || '';
    typeInput.value = item.category || (item.type === 'גיפטקארד' ? 'giftcard' : 'club');
    usageInput.value = item.usage || '';
    detailsInput.value = item.details || '';
    expiryInput.value = item.expiry || '';

    editingId = id;
    submitBtn.textContent = 'עדכון פרטים';
    submitBtn.style.background = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function displayResults(results) {
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">לא נמצאו הטבות או כרטיסים מתאימים...</p>';
        return;
    }

    results.forEach(item => {
        const cardTitle = item.name || item.store || 'ללא שם';
        const cardStores = item.stores ? `<p class="details"><strong>🛍️ תקף ברשתות:</strong> ${item.stores}</p>` : '';
        
        let usageHtml = '';
        if (item.usage === 'online') usageHtml = '<span class="usage-badge">🌐 אונליין בלבד</span>';
        else if (item.usage === 'instore') usageHtml = '<span class="usage-badge">🏬 בסניפים בלבד</span>';
        else if (item.usage === 'both') usageHtml = '<span class="usage-badge">🛒 חנות ואונליין</span>';

        const card = document.createElement('div');
        card.className = `result-card ${item.category}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${cardTitle}</h3>
                <span class="badge">${item.type}</span>
            </div>
            ${usageHtml}
            ${cardStores}
            <p class="details"><strong>💎 פרטים:</strong> ${item.details}</p>
            ${item.expiry ? `<p class="expiry">📅 תוקף: ${item.expiry}</p>` : ''}
            
            <div class="card-actions">
                <button class="action-btn edit" onclick="editBenefit(${item.id})">✏️ עריכה</button>
                <button class="action-btn delete" onclick="deleteBenefit(${item.id})">🗑️ מחיקה</button>
            </div>
        `;
        
        resultsContainer.appendChild(card);
    });
}

function getSearchTerms(query) {
    let terms = [query];
    for (const [key, translatedValue] of Object.entries(storeDictionary)) {
        if (key.includes(query)) {
            terms.push(translatedValue);
        }
    }
    return terms;
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query === '') {
        resultsContainer.innerHTML = '';
        return;
    }

    const searchTerms = getSearchTerms(query);

    const filtered = myBenefits.filter(item => {
        return searchTerms.some(term => {
            const nameMatch = (item.name && item.name.toLowerCase().includes(term)) || (item.store && item.store.toLowerCase().includes(term));
            const storesMatch = item.stores && item.stores.toLowerCase().includes(term);
            const detailsMatch = item.details && item.details.toLowerCase().includes(term);
            
            return nameMatch || storesMatch || detailsMatch;
        });
    });

    displayResults(filtered);
});

checkExpirations();