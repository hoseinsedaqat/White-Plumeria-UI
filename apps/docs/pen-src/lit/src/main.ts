import '@white-plumeria/styles';
import { defineWhitePlumeria } from '@white-plumeria/lit';
import { readPenComponent } from '../../component.ts';

defineWhitePlumeria();

const app = document.querySelector('#app');
const component = readPenComponent();
if (app) {
  if (component === 'badge') {
    const badge = document.createElement('wpl-badge');
    badge.setAttribute('variant', 'success');
    badge.textContent = 'Paid';
    app.replaceChildren(badge);
  } else if (component === 'alert') {
    const alert = document.createElement('wpl-alert');
    alert.setAttribute('variant', 'info');
    alert.setAttribute('title', 'Info');
    alert.textContent = 'Sample notice.';
    app.replaceChildren(alert);
  } else if (component === 'card') {
    const card = document.createElement('wpl-card');
    card.setAttribute('title', 'Ledger');
    card.setAttribute('description', 'A titled surface.');
    app.replaceChildren(card);
  } else if (component === 'switch') {
    const field = document.createElement('wpl-switch');
    field.setAttribute('label', 'Enabled');
    field.setAttribute('default-checked', '');
    app.replaceChildren(field);
  } else if (component === 'input') {
    const field = document.createElement('wpl-input');
    field.setAttribute('placeholder', 'ada@example.com');
    field.setAttribute('aria-label', 'Email');
    app.replaceChildren(field);
  } else {
    const card = document.createElement('wpl-card');
    card.setAttribute('title', 'Lit');
    card.setAttribute('description', 'wpl-button is a custom element in this document.');
    const button = document.createElement('wpl-button');
    button.textContent = 'Save changes';
    const note = document.createElement('p');
    note.id = 'note';
    note.textContent = 'Ready in this Lit document.';
    button.addEventListener('wpl-click', () => {
      note.textContent = 'Saved in this Lit document.';
    });
    card.append(button, note);
    app.replaceChildren(card);
  }
}
