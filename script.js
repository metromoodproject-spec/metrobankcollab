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
        phone: '+63 917 123 4567',
        avatar: null
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
    savedBillers: [
        { id: 1, name: 'Meralco', category: 'electricity', accountNo: '1234567890' },
        { id: 2, name: 'PLDT', category: 'internet', accountNo: '0987654321' }
    ],
    savedAccounts: [
        { id: 1, name: 'Maria Santos', bank: 'BDO', accountNo: '****1234' },
        { id: 2, name: 'Jose Rizal', bank: 'BPI', accountNo: '****5678' }
    ],
    settings: {
        notifications: true,
        biometrics: false,
        darkMode: false,
        language: 'en'
    },
    notifications: []
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
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-page]');
    const overlay = document.getElementById('sidebarOverlay');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    });

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });
}

function navigateTo(page) {
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-page]');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    // Update active state
    sidebarItems.forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`.sidebar-item[data-page="${page}"]`);
    if (activeItem) activeItem.classList.add('active');
    
    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        pageElement.classList.add('fade-in');
    }
    
    // Close mobile sidebar
    if (window.innerWidth < 1024) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    }

    // Page-specific initialization
    if (page === 'flowtracker') {
        renderCalendar();
    }
}

// ============================================
// DASHBOARD
// ============================================
function initDashboard() {
    updateBalances();
    renderRecentTransactions();
    initQuickActions();
}

function updateBalances() {
    document.getElementById('mainBalance').textContent = formatCurrency(state.accounts.savings.balance);
    document.getElementById('creditBalance').textContent = formatCurrency(state.accounts.credit.balance);
    document.getElementById('timeDepositBalance').textContent = formatCurrency(state.accounts.timeDeposit.balance);
    
    // Update mood balance if exists
    const moodBalance = document.getElementById('moodBalance');
    if (moodBalance) {
        moodBalance.textContent = formatCurrency(state.accounts.savings.balance);
    }
}

function renderRecentTransactions(limit = 5) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const transactions = state.transactions.slice(0, limit);
    
    container.innerHTML = transactions.map(t => `
        <div class="transaction-item flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer" onclick="viewTransaction(${t.id})">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center">
                    <i class="fas ${t.type === 'credit' ? 'fa-arrow-down text-green-500' : 'fa-arrow-up text-red-500'}"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">${t.description}</p>
                    <p class="text-xs text-gray-500">${formatDate(t.date)}, ${formatDate(t.date, 'time')}</p>
                </div>
            </div>
            <span class="${t.type === 'credit' ? 'text-green-500' : 'text-red-500'} font-medium">
                ${t.type === 'credit' ? '+' : '-'} ${formatCurrency(t.amount)}
            </span>
        </div>
    `).join('');
}

function viewTransaction(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    document.getElementById('txDetailDesc').textContent = transaction.description;
    document.getElementById('txDetailAmount').textContent = formatCurrency(transaction.amount);
    document.getElementById('txDetailAmount').className = transaction.type === 'credit' ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    document.getElementById('txDetailType').textContent = transaction.type === 'credit' ? 'Money In' : 'Money Out';
    document.getElementById('txDetailDate').textContent = formatDate(transaction.date, 'long');
    document.getElementById('txDetailTime').textContent = formatDate(transaction.date, 'time');
    document.getElementById('txDetailCategory').textContent = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);
    document.getElementById('txDetailRef').textContent = 'MB' + transaction.id.toString().padStart(12, '0');
    
    openModal('transactionModal');
}

function initQuickActions() {
    document.getElementById('qaSend').addEventListener('click', () => navigateTo('transfer'));
    document.getElementById('qaQR').addEventListener('click', () => openModal('qrModal'));
    document.getElementById('qaLoad').addEventListener('click', () => openModal('loadModal'));
    document.getElementById('qaBills').addEventListener('click', () => navigateTo('bills'));
    document.getElementById('qaMore').addEventListener('click', () => openModal('moreActionsModal'));
}

// ============================================
// ACCOUNTS PAGE
// ============================================
function initAccounts() {
    document.querySelectorAll('.account-card').forEach(card => {
        card.addEventListener('click', () => {
            const accountType = card.dataset.account;
            showAccountDetails(accountType);
        });
    });
}

function showAccountDetails(type) {
    const account = state.accounts[type];
    if (!account) return;
    
    document.getElementById('accountDetailTitle').textContent = account.type;
    document.getElementById('accountDetailNumber').textContent = account.number;
    document.getElementById('accountDetailBalance').textContent = formatCurrency(account.balance);
    document.getElementById('accountDetailStatus').textContent = account.status;
    
    // Show account-specific info
    const extraInfo = document.getElementById('accountExtraInfo');
    if (type === 'credit') {
        extraInfo.innerHTML = `
            <div class="flex justify-between"><span>Credit Limit:</span><span>${formatCurrency(account.limit)}</span></div>
            <div class="flex justify-between"><span>Available Credit:</span><span>${formatCurrency(account.limit - account.balance)}</span></div>
            <div class="flex justify-between"><span>Due Date:</span><span>${formatDate(account.dueDate)}</span></div>
        `;
    } else if (type === 'timeDeposit') {
        extraInfo.innerHTML = `
            <div class="flex justify-between"><span>Interest Rate:</span><span>${account.interestRate}% p.a.</span></div>
            <div class="flex justify-between"><span>Maturity Date:</span><span>${formatDate(account.maturity)}</span></div>
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
    const form = document.getElementById('transferForm');
    const transferBtn = document.getElementById('transferBtn');
    
    // Populate saved accounts
    renderSavedAccounts();
    
    transferBtn.addEventListener('click', processTransfer);
    
    // Amount input formatting
    const amountInput = document.getElementById('transferAmount');
    amountInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        e.target.value = value;
    });
}

function renderSavedAccounts() {
    const container = document.getElementById('savedAccountsList');
    if (!container) return;
    
    if (state.savedAccounts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No saved accounts</p>';
        return;
    }
    
    container.innerHTML = state.savedAccounts.map(acc => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onclick="selectSavedAccount('${acc.accountNo}', '${acc.name}', '${acc.bank}')">
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

function selectSavedAccount(accountNo, name, bank) {
    document.getElementById('transferAccountNo').value = accountNo.replace(/\*/g, '0');
    document.getElementById('transferBank').value = bank.toLowerCase();
    showToast(`Selected ${name}`, 'info');
}

function processTransfer() {
    const accountNo = document.getElementById('transferAccountNo').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const bank = document.getElementById('transferBank').value;
    const notes = document.getElementById('transferNotes').value;
    
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
    
    // Simulate transfer
    document.getElementById('transferBtn').disabled = true;
    document.getElementById('transferBtn').innerHTML = '<i class="fas fa-spinner spin mr-2"></i>Processing...';
    
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
        
        document.getElementById('transferBtn').disabled = false;
        document.getElementById('transferBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Transfer Now';
        
        // Reset form
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
    document.querySelectorAll('.bill-category').forEach(cat => {
        cat.addEventListener('click', () => {
            showBillPayment(cat.dataset.category);
        });
    });
}

function showBillPayment(category) {
    const categoryNames = {
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
    
    document.getElementById('billCategoryTitle').textContent = categoryNames[category] || category;
    
    const billerSelect = document.getElementById('billBiller');
    billerSelect.innerHTML = '<option value="">Select Biller</option>' + 
        (billers[category] || []).map(b => `<option value="${b.toLowerCase()}">${b}</option>`).join('');
    
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
    
    const payBtn = document.getElementById('payBillBtn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-spinner spin mr-2"></i>Processing...';
    
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
        
        payBtn.disabled = false;
        payBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Pay Bill';
        
        closeModal('billPaymentModal');
        showToast(`Bill payment of ${formatCurrency(amount)} successful!`, 'success');
    }, 2000);
}

// ============================================
// METROMOOD
// ============================================
function initMetroMood() {
    const moodBubbles = document.querySelectorAll('.mood-bubble');
    const savingsGoalCard = document.getElementById('savingsGoalCard');
    const saveFundsBtn = document.getElementById('saveFundsBtn');

    moodBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            moodBubbles.forEach(b => b.classList.remove('selected'));
            bubble.classList.add('selected');
            
            const mood = bubble.dataset.mood;
            const goal = parseInt(bubble.dataset.goal);
            const emoji = bubble.querySelector('.mood-emoji').textContent;
            
            document.getElementById('selectedMoodEmoji').textContent = emoji;
            document.getElementById('selectedMoodText').textContent = mood;
            document.getElementById('suggestedAmount').textContent = formatCurrency(goal);
            document.getElementById('saveAmount').value = goal;
            
            savingsGoalCard.classList.remove('hidden');
        });
    });

    saveFundsBtn.addEventListener('click', saveMoodFunds);
    
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

    const selectedMood = document.querySelector('.mood-bubble.selected');
    const mood = selectedMood ? selectedMood.dataset.mood : 'happy';
    const emoji = selectedMood ? selectedMood.querySelector('.mood-emoji').textContent : '😊';
    
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
    
    document.getElementById('saveAmount').value = '';
    document.querySelectorAll('.mood-bubble').forEach(b => b.classList.remove('selected'));
    document.getElementById('savingsGoalCard').classList.add('hidden');
    
    showToast(`${formatCurrency(amount)} saved and locked for 7 days!`, 'success');
}

function updateMoodSavingsUI() {
    const totalMoodSavings = state.moodSavings.reduce((sum, s) => sum + s.amount, 0);
    document.getElementById('moodSavingsTotal').textContent = formatCurrency(totalMoodSavings);
    
    const container = document.getElementById('lockedSavingsList');
    const now = new Date();
    
    if (state.moodSavings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-piggy-bank text-4xl mb-2"></i>
                <p>No mood savings yet. Select your mood and start saving!</p>
            </div>
        `;
    } else {
        container.innerHTML = state.moodSavings.map(saving => {
            const lockDate = new Date(saving.lockedUntil);
            const isLocked = lockDate > now;
            const daysLeft = Math.ceil((lockDate - now) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="flex items-center justify-between p-4 ${isLocked ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200' : 'bg-green-50 border border-green-200'} rounded-xl">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${saving.emoji}</span>
                        <div>
                            <p class="font-semibold text-gray-800">${formatCurrency(saving.amount)}</p>
                            <p class="text-xs text-gray-500">${saving.mood.charAt(0).toUpperCase() + saving.mood.slice(1)} mood</p>
                        </div>
                    </div>
                    <div class="text-right">
                        ${isLocked ? 
                            `<p class="text-sm font-medium text-purple-600"><i class="fas fa-lock mr-1"></i>${daysLeft} days left</p>
                             <p class="text-xs text-gray-500">Unlocks ${formatDate(lockDate)}</p>` :
                            `<p class="text-sm font-medium text-green-600"><i class="fas fa-unlock mr-1"></i>Unlocked!</p>
                             <button class="text-xs text-blue-600 hover:underline" onclick="releaseSaving('${saving.id}')">Release to Balance</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Update lock status
    const lockedSavings = state.moodSavings.filter(s => new Date(s.lockedUntil) > now);
    if (lockedSavings.length > 0) {
        const earliestUnlock = new Date(Math.min(...lockedSavings.map(s => new Date(s.lockedUntil))));
        document.getElementById('lockStatus').textContent = formatDate(earliestUnlock);
    } else {
        document.getElementById('lockStatus').textContent = 'No locked funds';
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
    document.getElementById('prevMonth').addEventListener('click', () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('logPeriodBtn').addEventListener('click', () => {
        openModal('logPeriodModal');
    });

    document.getElementById('savePeriod').addEventListener('click', savePeriod);

    // Symptom tags
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    document.getElementById('saveSymptoms').addEventListener('click', saveSymptoms);

    renderCalendar();
    updateSymptomHistory();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
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
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="h-10"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        let classes = 'calendar-day h-10 flex items-center justify-center rounded-lg cursor-pointer text-sm';
        
        // Check if today
        if (date.toDateString() === today.toDateString()) {
            classes += ' today';
        }
        
        // Check if period day
        const isPeriod = state.periods.some(p => {
            const start = new Date(p.start);
            const end = new Date(p.end);
            return date >= start && date <= end;
        });
        
        if (isPeriod) {
            classes += ' period';
        }
        
        // Check if predicted
        const isPredicted = date >= nextPeriod && 
            date < new Date(nextPeriod.getTime() + state.periodLength * 24 * 60 * 60 * 1000);
        
        if (isPredicted && !isPeriod) {
            classes += ' predicted';
        }
        
        html += `<div class="${classes}" data-date="${dateStr}" onclick="selectCalendarDay('${dateStr}')">${day}</div>`;
    }
    
    grid.innerHTML = html;
    
    // Update next period display
    document.getElementById('nextPeriod').textContent = formatDate(nextPeriod);
    document.getElementById('lastPeriod').textContent = formatDate(state.lastPeriodStart);
    
    // Check if period is coming soon
    const daysUntilPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    if (daysUntilPeriod <= 7 && daysUntilPeriod > 0) {
        document.getElementById('periodAlert').classList.remove('hidden');
        document.getElementById('periodAlertText').textContent = 
            `Your period is predicted to start in ${daysUntilPeriod} day${daysUntilPeriod > 1 ? 's' : ''}. Your savings are locked for this week.`;
        document.getElementById('flowSavingsLock').classList.remove('hidden');
        document.getElementById('notificationBadge').classList.remove('hidden');
        
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + 7);
        document.getElementById('unlockDate').textContent = formatDate(unlockDate);
    } else {
        document.getElementById('periodAlert').classList.add('hidden');
        document.getElementById('flowSavingsLock').classList.add('hidden');
    }
}

function selectCalendarDay(dateStr) {
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    document.querySelector(`.calendar-day[data-date="${dateStr}"]`)?.classList.add('selected');
}

function savePeriod() {
    const startDate = document.getElementById('periodStartDate').value;
    const endDate = document.getElementById('periodEndDate').value;
    const intensity = document.getElementById('flowIntensity').value;

    if (!startDate || !endDate) {
        showToast('Please select dates', 'error');
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

function saveSymptoms() {
    const today = new Date().toISOString().split('T')[0];
    const activeSymptoms = [];
    document.querySelectorAll('.symptom-tag.active').forEach(tag => {
        activeSymptoms.push(tag.dataset.symptom);
    });
    
    if (activeSymptoms.length === 0) {
        showToast('Please select at least one symptom', 'error');
        return;
    }
    
    state.symptoms[today] = activeSymptoms;
    saveState();
    updateSymptomHistory();
    
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    showToast('Symptoms saved!', 'success');
}

function updateSymptomHistory() {
    const container = document.getElementById('symptomHistory');
    const entries = Object.entries(state.symptoms).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-400">
                <i class="fas fa-clipboard-list text-3xl mb-2"></i>
                <p>No symptoms logged yet</p>
            </div>
        `;
        return;
    }
    
    const symptomLabels = {
        cramps: '🤕 Cramps',
        headache: '😵 Headache',
        bloating: '😮‍💨 Bloating',
        fatigue: '😴 Fatigue',
        mood: '😢 Mood Swings',
        cravings: '🍫 Cravings'
    };
    
    container.innerHTML = entries.slice(0, 5).map(([date, symptoms]) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
                <p class="font-medium text-gray-800">${formatDate(date)}</p>
                <div class="flex flex-wrap gap-1 mt-1">
                    ${symptoms.map(s => `<span class="text-xs bg-gray-200 px-2 py-0.5 rounded-full">${symptomLabels[s] || s}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// SETTINGS
// ============================================
function initSettings() {
    // Populate user info
    document.getElementById('settingsName').value = state.user.name;
    document.getElementById('settingsEmail').value = state.user.email;
    document.getElementById('settingsPhone').value = state.user.phone;
    
    // Toggles
    document.getElementById('notificationToggle').checked = state.settings.notifications;
    document.getElementById('biometricsToggle').checked = state.settings.biometrics;
    
    // Save profile
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    
    // Change password
    document.getElementById('changePasswordBtn').addEventListener('click', () => openModal('changePasswordModal'));
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

function saveProfile() {
    state.user.name = document.getElementById('settingsName').value;
    state.user.email = document.getElementById('settingsEmail').value;
    state.user.phone = document.getElementById('settingsPhone').value;
    state.settings.notifications = document.getElementById('notificationToggle').checked;
    state.settings.biometrics = document.getElementById('biometricsToggle').checked;
    
    saveState();
    document.getElementById('userName').textContent = state.user.name;
    showToast('Profile updated successfully!', 'success');
}

function changePassword() {
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
// LOAD/BUY LOAD
// ============================================
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
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Buy Load';
        
        closeModal('loadModal');
        showToast(`Load of ₱${amount} sent to ${phone}!`, 'success');
    }, 2000);
}

// ============================================
// VIEW ALL TRANSACTIONS
// ============================================
function viewAllTransactions() {
    navigateTo('transactions');
    renderAllTransactions();
}

function renderAllTransactions() {
    const container = document.getElementById('allTransactionsList');
    if (!container) return;
    
    container.innerHTML = state.transactions.map(t => `
        <div class="transaction-item flex items-center justify-between p-4 bg-white rounded-lg card-shadow cursor-pointer mb-3" onclick="viewTransaction(${t.id})">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center">
                    <i class="fas ${getCategoryIcon(t.category)} ${t.type === 'credit' ? 'text-green-500' : 'text-red-500'}"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-800">${t.description}</p>
                    <p class="text-sm text-gray-500">${formatDate(t.date, 'long')}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="${t.type === 'credit' ? 'text-green-500' : 'text-red-500'} font-bold text-lg">
                    ${t.type === 'credit' ? '+' : '-'} ${formatCurrency(t.amount)}
                </span>
                <p class="text-xs text-gray-400">${t.category}</p>
            </div>
        </div>
    `).join('');
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
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initNavigation();
    initDashboard();
    initAccounts();
    initTransfer();
    initBills();
    initMetroMood();
    initFlowtracker();
    initSettings();
    
    // Update user name
    document.getElementById('userName').textContent = state.user.name;
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
});
