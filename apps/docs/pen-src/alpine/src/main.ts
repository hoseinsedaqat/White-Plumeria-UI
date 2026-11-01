import Alpine from 'alpinejs';
import '@white-plumeria/styles';
import { whitePlumeria } from '@white-plumeria/alpine';

Alpine.plugin(whitePlumeria);

const app = document.querySelector('#app');
if (app) {
  app.innerHTML = `
    <div x-data="WhitePlumeriaProvider({ persist: false, theme: 'white', appearance: 'light' })">
      <div x-data='Button(${JSON.stringify({ label: 'Save changes' })})'></div>
      <p id="note">Ready in this Alpine document.</p>
    </div>
  `;
  app.addEventListener('wpl-click', () => {
    const note = document.querySelector('#note');
    if (note) note.textContent = 'Saved in this Alpine document.';
  });
  Alpine.start();
}
