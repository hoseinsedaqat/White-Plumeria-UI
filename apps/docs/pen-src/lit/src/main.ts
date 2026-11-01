import '@white-plumeria/styles';
import { defineWhitePlumeria } from '@white-plumeria/lit';

defineWhitePlumeria();

const app = document.querySelector('#app');
if (app) {
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
