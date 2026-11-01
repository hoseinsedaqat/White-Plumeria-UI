import Alpine from 'alpinejs';
import '@white-plumeria/styles';
import { whitePlumeria } from '@white-plumeria/alpine';
import { readPenComponent } from '../../component.ts';

Alpine.plugin(whitePlumeria);

const app = document.querySelector('#app');
const component = readPenComponent();
if (app) {
  const expression =
    component === 'badge'
      ? `Badge(${JSON.stringify({ variant: 'success', label: 'Paid' })})`
      : component === 'alert'
        ? `Alert(${JSON.stringify({ variant: 'info', title: 'Info', description: 'Sample notice.' })})`
        : component === 'card'
          ? `Card(${JSON.stringify({ title: 'Ledger', description: 'A titled surface.' })})`
          : component === 'switch'
            ? `Switch(${JSON.stringify({ label: 'Enabled', checked: true })})`
            : component === 'input'
              ? `Input(${JSON.stringify({ label: 'Email', placeholder: 'ada@example.com' })})`
              : `Button(${JSON.stringify({ label: 'Save changes' })})`;
  const note = component === 'button' ? '<p id="note">Ready in this Alpine document.</p>' : '';
  app.innerHTML = `
    <div x-data="WhitePlumeriaProvider({ persist: false, theme: 'white', appearance: 'light' })">
      <div x-data='${expression}'></div>
      ${note}
    </div>
  `;
  if (component === 'button') {
    app.addEventListener('wpl-click', () => {
      const status = document.querySelector('#note');
      if (status) status.textContent = 'Saved in this Alpine document.';
    });
  }
  Alpine.start();
}
