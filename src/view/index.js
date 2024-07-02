document.addEventListener('DOMContentLoaded', () => {
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const expenseFormContainer = document.getElementById('expense-form-container');
  const expenseForm = document.getElementById('expense-form');
  const expensesList = document.getElementById('expenses');

  addExpenseBtn.addEventListener('click', () => {
    expenseFormContainer.style.display =
      expenseFormContainer.style.display === 'none' ? 'block' : 'none';
  });

  expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const paymentMethod = document.getElementById('payment-method').value;

    if (date && category && amount && paymentMethod) {
      const expenseItem = document.createElement('li');
      expenseItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      expenseItem.innerHTML = `
          <div>
            <strong>Date:</strong> ${date} <br>
            <strong>Category:</strong> ${category} <br>
            <strong>Amount:</strong> $${amount} <br>
            <strong>Payment Method:</strong> ${paymentMethod}
          </div>
          <button class="btn btn-danger btn-sm" onclick="removeExpense(this)">Remove</button>
        `;
      expensesList.appendChild(expenseItem);

      expenseForm.reset();
      expenseFormContainer.style.display = 'none';
    }
  });
});

function removeExpense(button) {
  button.parentElement.remove();
}
