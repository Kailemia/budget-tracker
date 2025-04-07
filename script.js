// Global variables
let transactions = [];
let currentFilter = 'all';

// Initialize the app on page load
function init() {
    loadFromCookie();
    displayTransactions();
    calculateTotals();
}

/**
 * Adds a new transaction to the list
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @param {string} type - 'income' or 'expense'
 */
function addTransaction(description, amount, type) {
    const id = Date.now();
    const transaction = {
        id,
        description,
        amount: type === 'income' ? amount : -amount // Positive for income, negative for expense
    };
    transactions.push(transaction);
    saveToCookie();
    displayTransactions();
    calculateTotals();
}

/**
 * Removes a transaction by ID
 * @param {number} id - Transaction ID
 */
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToCookie();
    displayTransactions();
    calculateTotals();
}

/**
 * Displays the transaction list based on the current filter
 */
function displayTransactions() {
    const filtered = getFilteredTransactions();
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    filtered.forEach(t => {
        const row = document.createElement('tr');
        const descCell = document.createElement('td');
        descCell.textContent = t.description;
        const amountCell = document.createElement('td');
        amountCell.textContent = t.amount > 0 ? `+${t.amount.toFixed(2)}` : t.amount.toFixed(2);
        amountCell.className = t.amount > 0 ? 'income' : 'expense';
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('data-id', t.id);
        actionCell.appendChild(deleteBtn);
        row.appendChild(descCell);
        row.appendChild(amountCell);
        row.appendChild(actionCell);
        list.appendChild(row);
    });
}

/**
 * Calculates and updates total income, expenses, and balance
 */
function calculateTotals() {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('total-income').textContent = income.toFixed(2);
    document.getElementById('total-expenses').textContent = expenses.toFixed(2);
    document.getElementById('balance').textContent = balance.toFixed(2);
}

/**
 * Returns transactions based on the current filter
 * @returns {Array} Filtered transactions
 */
function getFilteredTransactions() {
    if (currentFilter === 'all') return transactions;
    return transactions.filter(t => (currentFilter === 'income' ? t.amount > 0 : t.amount < 0));
}

/**
 * Sets the current filter and refreshes the display
 * @param {string} filter - 'all', 'income', or 'expenses'
 */
function setFilter(filter) {
    currentFilter = filter;
    displayTransactions();
}

/**
 * Saves transactions to a cookie
 */
function saveToCookie() {
    setCookie('transactions', JSON.stringify(transactions), 365);
}

/**
 * Loads transactions from a cookie
 */
function loadFromCookie() {
    const cookie = getCookie('transactions');
    if (cookie) {
        try {
            transactions = JSON.parse(cookie);
        } catch (e) {
            console.error('Error parsing cookie', e);
            transactions = [];
        }
    } else {
        transactions = [];
    }
}

/**
 * Sets a cookie with the given name, value, and expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

/**
 * Retrieves a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Event Listeners
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.querySelector('input[name="type"]:checked').value;
    if (description && !isNaN(amount) && amount > 0) {
        addTransaction(description, amount, type);
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    } else {
        alert('Please enter a valid description and positive amount.');
    }
});

document.getElementById('transaction-list').addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        const id = parseInt(e.target.getAttribute('data-id'));
        removeTransaction(id);
    }
});

document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
document.getElementById('filter-income').addEventListener('click', () => setFilter('income'));
document.getElementById('filter-expenses').addEventListener('click', () => setFilter('expenses'));

// Start the app
init();
