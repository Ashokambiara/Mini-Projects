const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');

let expression = '';

const updateDisplay = () => {
  display.value = expression || '0';
};

const isOperator = (value) => ['+', '-', '*', '/'].includes(value);

buttons.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { value, action } = button.dataset;

  if (action === 'clear') {
    expression = '';
    updateDisplay();
    return;
  }

  if (action === 'delete') {
    expression = expression.slice(0, -1);
    updateDisplay();
    return;
  }

  if (action === 'calculate') {
    try {
      if (!expression || isOperator(expression.at(-1))) return;
      const result = Function(`"use strict"; return (${expression})`)();
      expression = Number.isFinite(result) ? String(result) : 'Error';
    } catch {
      expression = 'Error';
    }
    updateDisplay();
    return;
  }

  if (!value) return;

  if (expression === 'Error') {
    expression = '';
  }

  const lastChar = expression.at(-1);

  if (isOperator(value)) {
    if (!expression) return;
    if (isOperator(lastChar)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
    updateDisplay();
    return;
  }

  if (value === '.') {
    const parts = expression.split(/[-+*/]/);
    if (parts.at(-1).includes('.')) return;
  }

  expression += value;
  updateDisplay();
});
