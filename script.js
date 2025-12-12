document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('expense-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netBalanceEl = document.getElementById('net-balance');
    const filterSelect = document.getElementById('filter-type');

    // State: Array to hold all transactions
    let transactions = [];

    // --- Core Functions ---

    // 1. Calculate and Update Totals
    const updateSummary = () => {
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
            const amount = parseFloat(t.amount);
            if (t.type === 'Income') {
                totalIncome += amount;
            } else { // Expense
                totalExpenses += amount;
            }
        });

        const netBalance = totalIncome - totalExpenses;

        // Update DOM elements with formatted currency
        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        netBalanceEl.textContent = `$${netBalance.toFixed(2)}`;
    };

    // 2. Render Transaction List
    const renderTransactions = () => {
        // Clear the current list
        transactionList.innerHTML = '';

        // Determine which transactions to display based on the filter
        const currentFilter = filterSelect.value;
        const filteredTransactions = transactions.filter(t => 
            currentFilter === 'All' || t.type === currentFilter
        );

        filteredTransactions.forEach(t => {
            const listItem = document.createElement('li');
            listItem.classList.add('transaction-item');

            const typeClass = t.type === 'Income' ? 'type-income' : 'type-expense';

            listItem.innerHTML = `
                <div class="transaction-details">
                    <span class="transaction-description">${t.description}</span>
                    <span class="transaction-amount">$${parseFloat(t.amount).toFixed(2)}</span>
                    <span class="transaction-type ${typeClass}">${t.type.toUpperCase()}</span>
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" data-id="${t.id}">Edit</button>
                    <button class="delete-btn" data-id="${t.id}">Delete</button>
                </div>
            `;

            transactionList.appendChild(listItem);
        });

        // Update the summary every time the list is rendered/changed
        updateSummary();
    };

    // 3. Save, Load, and Initialize
    const saveTransactions = () => {
        localStorage.setItem('walletWatchTransactions', JSON.stringify(transactions));
    };

    const loadTransactions = () => {
        const storedTransactions = localStorage.getItem('walletWatchTransactions');
        if (storedTransactions) {
            transactions = JSON.parse(storedTransactions);
        } else {
            // Initial dummy data if storage is empty (matches image)
            transactions = [
                { id: Date.now() + 1, description: 'Food', amount: '20.00', type: 'Expense' },
                { id: Date.now() + 2, description: 'Allowance', amount: '700.00', type: 'Income' },
                { id: Date.now() + 3, description: 'Party', amount: '400.00', type: 'Expense' },
            ];
        }
        renderTransactions();
    };

    // --- Event Handlers ---

    // Handle form submission (Add/Edit)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value).toFixed(2); // Ensure 2 decimal places
        const type = typeSelect.value;

        if (description && amount > 0) {
            // New transaction object
            const newTransaction = {
                id: Date.now(),
                description,
                amount,
                type
            };

            transactions.push(newTransaction);

            // Clear form inputs
            descriptionInput.value = '';
            amountInput.value = '';
            typeSelect.value = 'Income'; // Reset to default

            // Update UI and Storage
            renderTransactions();
            saveTransactions();
        } else {
            alert('Please enter a valid description and a positive amount.');
        }
    });

    // Handle Delete and Edit Clicks
    transactionList.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);

        if (e.target.classList.contains('delete-btn')) {
            // DELETE functionality
            transactions = transactions.filter(t => t.id !== id);
            renderTransactions();
            saveTransactions();
        } 
        
        // Basic EDIT functionality (for demonstration: fills form with data)
        if (e.target.classList.contains('edit-btn')) {
             const transactionToEdit = transactions.find(t => t.id === id);
             if (transactionToEdit) {
                // Remove transaction from list and fill the form for re-submission
                transactions = transactions.filter(t => t.id !== id);
                
                descriptionInput.value = transactionToEdit.description;
                amountInput.value = transactionToEdit.amount;
                typeSelect.value = transactionToEdit.type;

                // Re-render and save the list without the item being edited
                renderTransactions();
                saveTransactions();

                // Note: In a real app, you'd handle the 'edit mode' more gracefully
                // (e.g., changing the 'Submit' button text to 'Save Edit').
                alert('Item data loaded into form. Please edit and click SUBMIT to save.');
             }
        }
    });

    // Handle Filtering
    filterSelect.addEventListener('change', renderTransactions);

    // Initial Load
    loadTransactions();
});