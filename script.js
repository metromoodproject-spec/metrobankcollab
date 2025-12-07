/* ============================================
   METROBANK ONLINE BANKING - JAVASCRIPT
   ============================================ */

// ============================================
// APP STATE
// ============================================
let state = {
    user: {
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@email.com',
        phone: '+63 917 123 4567'
    },
    accounts: {
        savings: {
            number: '1234-5678-9012-3456',
            balance: 125450.75,
            type: 'Savings Account',
            status: 'Active'
        },
        credit: {
            number: '****-****-****-5678',
            balance: 45230.00,
            limit: 100000,
            type: 'Metrobank Credit Card',
            status: 'Active',
            dueDate: '2024-02-15'
        },
        timeDeposit: {
            number: '****-****-****-9012',
            balance: 500000.00,
            type: 'Time Deposit',
            maturity: '2024-12-31',
            interestRate: 5.5
        }
    },
    transactions: [
        { id: 1, type: 'debit', description: 'GCash Transfer', amount: 1500, date: new Date(), category: 'transfer' },
        { id: 2, type: 'credit', description: 'Salary Credit', amount: 35000, date: new Date(Date.now() - 86400000), category: 'income' },
        { id: 3, type: 'debit', description: 'Meralco Payment', amount: 3245.50, date: new Date(2024, 0, 15), category: 'bills' },
        { id: 4, type: 'debit', description: 'Jollibee', amount: 450, date: new Date(2024, 0, 14), category: 'food' },
        { id: 5, type: 'debit', description: 'Grab Ride', amount: 180, date: new Date(2024, 0, 13), category: 'transport' },
        { id: 6, type: 'credit', description: 'Fund Transfer Received', amount: 5000, date: new Date(2024, 0, 12), category: 'transfer' },
        { id: 7, type: 'debit', description: 'Netflix Subscription', amount: 549, date: new Date(2024, 0, 10), category: 'entertainment' },
        { id: 8, type: 'debit', description: 'PLDT Payment', amount: 1899, date: new Date(2024, 0, 8), category: 'bills' }
    ],
    moodSavings: [],
    periods: [],
    symptoms: {},
    currentMonth: new Date(),
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: new Date(2024, 0, 1),
    savedAccounts: [
        { id: 1, name: 'Maria Santos', bank: 'BDO', accountNo: '****1234' },
        { id: 2, name: 'Jose Rizal', bank: 'BPI', accountNo: '****5678' }
    ],
    settings: {
        notifications: true,
        biometrics: false
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return '₱ ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (format === 'time') {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return d.toLocaleDateString();
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// ============================================
// LOCAL STORAGE
// ============================================
function loadState() {
    const saved = localStorage.getItem('metrobankState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = {
                ...state,
                ...parsed,
                currentMonth: new Date(parsed.currentMonth || new Date()),
                lastPeriodStart: new Date(parsed.lastPeriodStart || new Date(2024, 0, 1)),
                transactions: parsed.transactions ? parsed.transactions.map(t => ({
                    ...t,
                    date: new Date(t.date)
                })) : state.transactions
            };
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }
}

function saveState() {
    localStorage.setItem('metrobankState', JSON.stringify(state));
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toastIcon.className = `fas ${icons[type] || icons.success}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.sidebar-item[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Hide all pages and show selected
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('fade-in');
    });
    
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        pageElement.classList.add('fade-in');
    }
    
    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth < 1024) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    }

    // Page-specific actions
    if (page === 'flowtracker') {
        renderCalendar();
    } else if (page === 'transactions') {
        renderAllTransactions();
    } else if (page === 'metromood') {
        updateMoodSavingsUI();
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadState();
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('hidden');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Initialize all modules
    initDashboard();
    initTransfer();
    initBills();
    initMetroMood();
    initFlowtracker();
    initSettings();
    
    // Update displays
    updateBalances();
    renderRecentTransactions();
    document.getElementById('userName').textContent = state.user.name;
}

// ============================================
// DASHBOARD
// ============================================
function initDashboard() {
    updateBalances();
    renderRecentTransactions();
}

function updateBalances() {
    const mainBalance = document.getElementById('mainBalance');
    const creditBalance = document.getElementById('creditBalance');
    const timeDepositBalance = document.getElementById('timeDepositBalance');
    const moodBalance = document.getElementById('moodBalance');
    
    if (mainBalance) mainBalance.textContent = formatCurrency(state.accounts.savings.balance);
    if (creditBalance) creditBalance.textContent = formatCurrency(state.accounts.credit.balance);
    if (timeDepositBalance) timeDepositBalance.textContent = formatCurrency(state.accounts.timeDeposit.balance);
    if (moodBalance) moodBalance.textContent = formatCurrency(state.accounts.savings.balance);
}

function renderRecentTransactions(limit = 5) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const transactions = state.transactions.slice(0, limit);
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = transactions.map(t => `
        <div class="transaction-item flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onclick="viewTransaction('${t.id}')">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas ${t.type === 'credit' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'}"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-medium text-gray-800 truncate">${t.description}</p>
                    <p class="text-xs text-gray-500">${formatDate(t.date)}</p>
                </div>
            </div>
            <span class="${t.type === 'credit' ? 'text-green-600' : 'text-red-600'} font-semibold whitespace-nowrap ml-2">
                ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
            </span>
        </div>
    `).join('');
}

function renderAllTransactions() {
    const container = document.getElementById('allTransactionsList');
    if (!container) return;
    
    if (state.transactions.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = state.transactions.map(t => `
        <div class="bg-white rounded-xl p-4 card-shadow cursor-pointer card-hover" onclick="viewTransaction('${t.id}')">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas ${getCategoryIcon(t.category)} ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'} text-lg"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${t.description}</p>
                        <p class="text-sm text-gray-500">${formatDate(t.date, 'long')}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="${t.type === 'credit' ? 'text-green-600' : 'text-red-600'} font-bold text-lg">
                        ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
                    </p>
                    <p class="text-xs text-gray-400 capitalize">${t.category}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function viewTransaction(id) {
    const transaction = state.transactions.find(t => t.id == id);
    if (!transaction) return;
    
    document.getElementById('txDetailDesc').textContent = transaction.description;
    document.getElementById('txDetailAmount').textContent = formatCurrency(transaction.amount);
    document.getElementById('txDetailAmount').className = `text-2xl font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`;
    document.getElementById('txDetailType').textContent = transaction.type === 'credit' ? 'Money In' : 'Money Out';
    document.getElementById('txDetailDate').textContent = formatDate(transaction.date, 'long');
    document.getElementById('txDetailTime').textContent = formatDate(transaction.date, 'time');
    document.getElementById('txDetailCategory').textContent = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);
    document.getElementById('txDetailRef').textContent = 'MB' + String(transaction.id).padStart(12, '0');
    
    openModal('transactionModal');
}

function getCategoryIcon(category) {
    const icons = {
        transfer: 'fa-exchange-alt',
        income: 'fa-arrow-down',
        bills: 'fa-file-invoice',
        food: 'fa-utensils',
        transport: 'fa-car',
        entertainment: 'fa-film',
        load: 'fa-mobile-alt',
        shopping: 'fa-shopping-bag'
    };
    return icons[category] || 'fa-circle';
}

// ============================================
// ACCOUNT DETAILS
// ============================================
function showAccountDetails(type) {
    const account = state.accounts[type];
    if (!account) return;
    
    document.getElementById('accountDetailTitle').textContent = account.type;
    document.getElementById('accountDetailNumber').textContent = account.number;
    document.getElementById('accountDetailBalance').textContent = formatCurrency(account.balance);
    document.getElementById('accountDetailStatus').textContent = account.status || 'Active';
    
    const extraInfo = document.getElementById('accountExtraInfo');
    if (type === 'credit') {
        extraInfo.innerHTML = `
            <div class="flex justify-between py-1"><span class="text-gray-500">Credit Limit:</span><span>${formatCurrency(account.limit)}</span></div>
            <div class="flex justify-between py-1"><span class="text-gray-500">Available:</span><span>${formatCurrency(account.limit - account.balance)}</span></div>
            <div class="flex justify-between py-1"><span class="text-gray-500">Due Date:</span><span>${formatDate(account.dueDate)}</span></div>
        `;
    } else if (type === 'timeDeposit') {
        extraInfo.innerHTML = `
            <div class="flex justify-between py-1"><span class="text-gray-500">Interest Rate:</span><span>${account.interestRate}% p.a.</span></div>
            <div class="flex justify-between py-1"><span class="text-gray-500">Maturity:</span><span>${formatDate(account.maturity)}</span></div>
        `;
    } else {
        extraInfo.innerHTML = '';
    }
    
    openModal('accountDetailModal');
}

// ============================================
// FUND TRANSFER
// ============================================
function initTransfer() {
    renderSavedAccounts();
    
    const transferBtn = document.getElementById('transferBtn');
    if (transferBtn) {
        transferBtn.addEventListener('click', processTransfer);
    }
}

function renderSavedAccounts() {
    const container = document.getElementById('savedAccountsList');
    if (!container) return;
    
    if (state.savedAccounts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No saved accounts yet</p>';
        return;
    }
    
    container.innerHTML = state.savedAccounts.map(acc => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onclick="selectSavedAccount('${acc.accountNo}', '${acc.bank}')">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-blue-600"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">${acc.name}</p>
                    <p class="text-xs text-gray-500">${acc.bank} • ${acc.accountNo}</p>
                </div>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
        </div>
    `).join('');
}

function selectSavedAccount(accountNo, bank) {
    document.getElementById('transferAccountNo').value = accountNo.replace(/\*/g, '0');
    document.getElementById('transferBank').value = bank.toLowerCase();
    showToast('Account selected', 'info');
}

function processTransfer() {
    const accountNo = document.getElementById('transferAccountNo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const bank = document.getElementById('transferBank').value;
    
    if (!accountNo || accountNo.length < 10) {
        showToast('Please enter a valid account number', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > state.accounts.savings.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    const btn = document.getElementById('transferBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner spin mr-2"></i>Processing...';
    
    setTimeout(() => {
        state.accounts.savings.balance -= amount;
        state.transactions.unshift({
            id: generateId(),
            type: 'debit',
            description: `Transfer to ${bank.toUpperCase()} ${accountNo.slice(-4)}`,
            amount: amount,
            date: new Date(),
            category: 'transfer'
        });
        
        saveState();
        updateBalances();
        renderRecentTransactions();
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Transfer Now';
        
        document.getElementById('transferAccountNo').value = '';
        document.getElementById('transferAmount').value = '';
        document.getElementById('transferNotes').value = '';
        
        showToast(`Successfully transferred ${formatCurrency(amount)}`, 'success');
    }, 2000);
}

// ============================================
// BILLS PAYMENT
// ============================================
function initBills() {
    const payBillBtn = document.getElementById('payBillBtn');
    if (payBillBtn) {
        payBillBtn.addEventListener('click', processBillPayment);
    }
}

function showBillPayment(category) {
    const names = {
        electricity: 'Electricity',
        water: 'Water',
        internet: 'Internet & Cable',
        phone: 'Phone',
        insurance: 'Insurance',
        credit: 'Credit Card',
        loans: 'Loans',
        government: 'Government'
    };
    
    const billers = {
        electricity: ['Meralco', 'VECO', 'BECO'],
        water: ['Maynilad', 'Manila Water', 'MCWD'],
        internet: ['PLDT', 'Globe', 'Converge', 'Sky Cable'],
        phone: ['Globe Postpaid', 'Smart Postpaid', 'DITO'],
        insurance: ['Philhealth', 'SSS', 'Pag-IBIG'],
        credit: ['Metrobank CC', 'BDO CC', 'BPI CC'],
        loans: ['Metrobank Loan', 'Home Loan', 'Auto Loan'],
        government: ['BIR', 'LTO', 'DFA']
    };
    
    document.getElementById('billCategoryTitle').textContent = names[category] || category;
    
    const select = document.getElementById('billBiller');
    select.innerHTML = '<option value="">Select Biller</option>' + 
        (billers[category] || []).map(b => `<option value="${b.toLowerCase()}">${b}</option>`).join('');
    
    // Reset form
    document.getElementById('billAccountNo').value = '';
    document.getElementById('billAmount').value = '';
    
    openModal('billPaymentModal');
}

function processBillPayment() {
    const biller = document.getElementById('billBiller').value;
    const accountNo = document.getElementById('billAccountNo').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    
    if (!biller) {
        showToast('Please select a biller', 'error');
        return;
    }
    if (!accountNo) {
        showToast('Please enter account number', 'error');
        return;
    }
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    if (amount > state.accounts.savings.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    const btn = document.getElementById('payBillBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner spin mr-2"></i>Processing...';
    
    setTimeout(() => {
        state.accounts.savings.balance -= amount;
        state.transactions.unshift({
            id: generateId(),
            type: 'debit',
            description: `${biller.toUpperCase()} Payment`,
            amount: amount,
            date: new Date(),
            category: 'bills'
        });
        
        saveState();
        updateBalances();
        renderRecentTransactions();
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Pay Bill';
        
        closeModal('billPaymentModal');
        showToast(`Bill payment of ${formatCurrency(amount)} successful!`, 'success');
    }, 2000);
}

// ============================================
// BUY LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const processLoadBtn = document.getElementById('processLoadBtn');
    if (processLoadBtn) {
        processLoadBtn.addEventListener('click', processLoad);
    }
});

function processLoad() {
    const phone = document.getElementById('loadPhone').value;
    const amount = parseInt(document.getElementById('loadAmount').value);
    const provider = document.getElementById('loadProvider').value;
    
    if (!phone || phone.length < 11) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }
    if (!amount) {
        showToast('Please select an amount', 'error');
        return;
    }
    if (amount > state.accounts.savings.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    const btn = document.getElementById('processLoadBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner spin mr-2"></i>Processing...';
    
    setTimeout(() => {
        state.accounts.savings.balance -= amount;
        state.transactions.unshift({
            id: generateId(),
            type: 'debit',
            description: `${provider.toUpperCase()} Load - ${phone}`,
            amount: amount,
            date: new Date(),
            category: 'load'
        });
        
        saveState();
        updateBalances();
        renderRecentTransactions();
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Buy Load';
        
        document.getElementById('loadPhone').value = '';
        document.getElementById('loadAmount').value = '';
        
        closeModal('loadModal');
        showToast(`Load of ₱${amount} sent to ${phone}!`, 'success');
    }, 2000);
}

// ============================================
// METROMOOD
// ============================================
function initMetroMood() {
    const moodBubbles = document.querySelectorAll('.mood-bubble');
    const saveFundsBtn = document.getElementById('saveFundsBtn');
    
    moodBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            // Remove selected from all
            moodBubbles.forEach(b => b.classList.remove('selected'));
            // Add to clicked
            bubble.classList.add('selected');
            
            const mood = bubble.dataset.mood;
            const goal = parseInt(bubble.dataset.goal);
            const emoji = bubble.querySelector('.mood-emoji').textContent;
            
            document.getElementById('selectedMoodEmoji').textContent = emoji;
            document.getElementById('selectedMoodText').textContent = mood;
            document.getElementById('suggestedAmount').textContent = formatCurrency(goal);
            document.getElementById('saveAmount').value = goal;
            
            document.getElementById('savingsGoalCard').classList.remove('hidden');
        });
    });
    
    if (saveFundsBtn) {
        saveFundsBtn.addEventListener('click', saveMoodFunds);
    }
    
    updateMoodSavingsUI();
}

function saveMoodFunds() {
    const amount = parseFloat(document.getElementById('saveAmount').value);
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    if (amount > state.accounts.savings.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    const selectedBubble = document.querySelector('.mood-bubble.selected');
    const mood = selectedBubble ? selectedBubble.dataset.mood : 'happy';
    const emoji = selectedBubble ? selectedBubble.querySelector('.mood-emoji').textContent : '😊';
    
    const lockDate = new Date();
    lockDate.setDate(lockDate.getDate() + 7);
    
    state.moodSavings.push({
        id: generateId(),
        amount: amount,
        mood: mood,
        emoji: emoji,
        lockedUntil: lockDate.toISOString(),
        createdAt: new Date().toISOString()
    });
    
    state.accounts.savings.balance -= amount;
    saveState();
    updateBalances();
    updateMoodSavingsUI();
    
    // Reset UI
    document.getElementById('saveAmount').value = '';
    document.querySelectorAll('.mood-bubble').forEach(b => b.classList.remove('selected'));
    document.getElementById('savingsGoalCard').classList.add('hidden');
    
    showToast(`${formatCurrency(amount)} saved and locked for 7 days!`, 'success');
}

function updateMoodSavingsUI() {
    const total = state.moodSavings.reduce((sum, s) => sum + s.amount, 0);
    const totalElement = document.getElementById('moodSavingsTotal');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    const container = document.getElementById('lockedSavingsList');
    if (!container) return;
    
    const now = new Date();
    
    if (state.moodSavings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-piggy-bank text-4xl mb-3 text-pink-300"></i>
                <p>No mood savings yet. Select your mood and start saving!</p>
            </div>
        `;
    } else {
        container.innerHTML = state.moodSavings.map(saving => {
            const lockDate = new Date(saving.lockedUntil);
            const isLocked = lockDate > now;
            const daysLeft = Math.ceil((lockDate - now) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="flex items-center justify-between p-4 ${isLocked ? 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200' : 'bg-green-50 border border-green-200'} rounded-xl">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${saving.emoji}</span>
                        <div>
                            <p class="font-bold text-gray-800">${formatCurrency(saving.amount)}</p>
                            <p class="text-xs text-gray-500 capitalize">${saving.mood} mood</p>
                        </div>
                    </div>
                    <div class="text-right">
                        ${isLocked ? 
                            `<p class="text-sm font-medium text-pink-600"><i class="fas fa-lock mr-1"></i>${daysLeft} days left</p>
                             <p class="text-xs text-gray-500">Unlocks ${formatDate(lockDate)}</p>` :
                            `<p class="text-sm font-medium text-green-600"><i class="fas fa-unlock mr-1"></i>Unlocked!</p>
                             <button class="text-xs text-pink-600 hover:underline font-medium" onclick="releaseSaving('${saving.id}')">Release Funds</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update lock status text
    const lockedSavings = state.moodSavings.filter(s => new Date(s.lockedUntil) > now);
    const lockStatus = document.getElementById('lockStatus');
    if (lockStatus) {
        if (lockedSavings.length > 0) {
            const earliest = new Date(Math.min(...lockedSavings.map(s => new Date(s.lockedUntil))));
            lockStatus.textContent = formatDate(earliest);
        } else {
            lockStatus.textContent = 'No locked funds';
        }
    }
}

function releaseSaving(id) {
    const saving = state.moodSavings.find(s => s.id === id);
    if (saving) {
        state.accounts.savings.balance += saving.amount;
        state.moodSavings = state.moodSavings.filter(s => s.id !== id);
        saveState();
        updateBalances();
        updateMoodSavingsUI();
        showToast(`${formatCurrency(saving.amount)} released to your balance!`, 'success');
    }
}

// ============================================
// FLOWTRACKER
// ============================================
function initFlowtracker() {
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const logPeriodBtn = document.getElementById('logPeriodBtn');
    const savePeriodBtn = document.getElementById('savePeriodBtn');
    const saveSymptoms = document.getElementById('saveSymptoms');
    
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
            renderCalendar();
        });
    }
    
    if (logPeriodBtn) {
        logPeriodBtn.addEventListener('click', () => openModal('logPeriodModal'));
    }
    
    if (savePeriodBtn) {
        savePeriodBtn.addEventListener('click', savePeriod);
    }
    
    if (saveSymptoms) {
        saveSymptoms.addEventListener('click', saveSymptomData);
    }
    
    // Symptom tag toggles
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    renderCalendar();
    updateSymptomHistory();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    if (!grid || !monthLabel) return;
    
    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = `${months[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Calculate predicted period
    const nextPeriod = new Date(state.lastPeriodStart);
    nextPeriod.setDate(nextPeriod.getDate() + state.cycleLength);
    
    let html = '';
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="h-10"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        let classes = 'calendar-day h-10';
        
        // Today
        if (date.toDateString() === today.toDateString()) {
            classes += ' today';
        }
        
        // Period days
        const isPeriod = state.periods.some(p => {
            const start = new Date(p.start);
            const end = new Date(p.end);
            return date >= start && date <= end;
        });
        if (isPeriod) {
            classes += ' period';
        }
        
        // Predicted
        const isPredicted = date >= nextPeriod && 
            date < new Date(nextPeriod.getTime() + state.periodLength * 24 * 60 * 60 * 1000);
        if (isPredicted && !isPeriod) {
            classes += ' predicted';
        }
        
        html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }
    
    grid.innerHTML = html;
    
    // Update info
    const nextPeriodEl = document.getElementById('nextPeriod');
    const lastPeriodEl = document.getElementById('lastPeriod');
    if (nextPeriodEl) nextPeriodEl.textContent = formatDate(nextPeriod);
    if (lastPeriodEl) lastPeriodEl.textContent = formatDate(state.lastPeriodStart);
    
    // Period alert
    const daysUntil = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    const alertEl = document.getElementById('periodAlert');
    const alertText = document.getElementById('periodAlertText');
    const lockEl = document.getElementById('flowSavingsLock');
    const badge = document.getElementById('notificationBadge');
    
    if (daysUntil <= 7 && daysUntil > 0) {
        if (alertEl) alertEl.classList.remove('hidden');
        if (alertText) alertText.textContent = `Your period is predicted to start in ${daysUntil} day${daysUntil > 1 ? 's' : ''}. Your savings are protected this week.`;
        if (lockEl) lockEl.classList.remove('hidden');
        if (badge) badge.classList.remove('hidden');
        
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + 7);
        const unlockEl = document.getElementById('unlockDate');
        if (unlockEl) unlockEl.textContent = formatDate(unlockDate);
    } else {
        if (alertEl) alertEl.classList.add('hidden');
        if (lockEl) lockEl.classList.add('hidden');
    }
}

function savePeriod() {
    const startDate = document.getElementById('periodStartDate').value;
    const endDate = document.getElementById('periodEndDate').value;
    const intensity = document.getElementById('flowIntensity').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both dates', 'error');
        return;
    }
    
    state.periods.push({
        id: generateId(),
        start: startDate,
        end: endDate,
        intensity: intensity
    });
    
    state.lastPeriodStart = new Date(startDate);
    saveState();
    renderCalendar();
    
    closeModal('logPeriodModal');
    showToast('Period logged successfully!', 'success');
}

function saveSymptomData() {
    const today = new Date().toISOString().split('T')[0];
    const active = [];
    
    document.querySelectorAll('.symptom-tag.active').forEach(tag => {
        active.push(tag.dataset.symptom);
    });
    
    if (active.length === 0) {
        showToast('Please select at least one symptom', 'error');
        return;
    }
    
    state.symptoms[today] = active;
    saveState();
    updateSymptomHistory();
    
    // Clear selections
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    showToast('Symptoms saved!', 'success');
}

function updateSymptomHistory() {
    const container = document.getElementById('symptomHistory');
    if (!container) return;
    
    const entries = Object.entries(state.symptoms).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-400">
                <i class="fas fa-clipboard-list text-3xl mb-2 text-pink-300"></i>
                <p>No symptoms logged yet</p>
            </div>
        `;
        return;
    }
    
    const labels = {
        cramps: '🤕 Cramps',
        headache: '😵 Headache',
        bloating: '😮‍💨 Bloating',
        fatigue: '😴 Fatigue',
        mood: '😢 Mood Swings',
        cravings: '🍫 Cravings'
    };
    
    container.innerHTML = entries.slice(0, 5).map(([date, symptoms]) => `
        <div class="p-3 bg-pink-50 rounded-lg">
            <p class="font-medium text-gray-800 mb-2">${formatDate(date)}</p>
            <div class="flex flex-wrap gap-1">
                ${symptoms.map(s => `<span class="text-xs bg-white px-2 py-1 rounded-full text-gray-600">${labels[s] || s}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ============================================
// SETTINGS
// ============================================
function initSettings() {
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordSubmit = document.getElementById('changePasswordSubmit');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Load current values
    const nameInput = document.getElementById('settingsName');
    const emailInput = document.getElementById('settingsEmail');
    const phoneInput = document.getElementById('settingsPhone');
    const notifToggle = document.getElementById('notificationToggle');
    const bioToggle = document.getElementById('biometricsToggle');
    
    if (nameInput) nameInput.value = state.user.name;
    if (emailInput) emailInput.value = state.user.email;
    if (phoneInput) phoneInput.value = state.user.phone;
    if (notifToggle) notifToggle.checked = state.settings.notifications;
    if (bioToggle) bioToggle.checked = state.settings.biometrics;
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            state.user.name = nameInput.value;
            state.user.email = emailInput.value;
            state.user.phone = phoneInput.value;
            state.settings.notifications = notifToggle.checked;
            state.settings.biometrics = bioToggle.checked;
            
            saveState();
            document.getElementById('userName').textContent = state.user.name;
            showToast('Profile updated successfully!', 'success');
        });
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => openModal('changePasswordModal'));
    }
    
    if (changePasswordSubmit) {
        changePasswordSubmit.addEventListener('click', () => {
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (!current || !newPass || !confirm) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            if (newPass !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }
            if (newPass.length < 8) {
                showToast('Password must be at least 8 characters', 'error');
                return;
            }
            
            closeModal('changePasswordModal');
            showToast('Password changed successfully!', 'success');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showToast('Logging out...', 'info');
        setTimeout(() => {
            openModal('loginModal');
        }, 1000);
    }
}

// ============================================
// START APP
// ============================================
document.addEventListener('DOMContentLoaded', init);