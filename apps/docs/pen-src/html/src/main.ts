import '@white-plumeria/styles';
import { readPenComponent } from '../../component.ts';

const app = document.querySelector('#app');
const component = readPenComponent();
if (app) {
  if (component === 'badge') {
    app.innerHTML = '<span class="wpl-badge wpl-badge-success">Paid</span>';
  } else if (component === 'alert') {
    app.innerHTML =
      '<div class="wpl-alert wpl-alert-info" role="status"><strong>Info</strong><p>Sample notice.</p></div>';
  } else if (component === 'card') {
    app.innerHTML =
      '<article class="wpl-card"><h2 class="wpl-card-title">Ledger</h2><p class="wpl-card-description">A titled surface.</p></article>';
  } else if (component === 'switch') {
    app.innerHTML =
      '<label class="wpl-switch"><input type="checkbox" role="switch" checked /><span class="wpl-switch-control" aria-hidden="true"></span>Enabled</label>';
  } else if (component === 'input') {
    app.innerHTML = '<input class="wpl-input" placeholder="ada@example.com" aria-label="Email" />';
  } else {
    app.innerHTML = `
      <button class="wpl-btn wpl-btn-primary" type="button" id="save">Save changes</button>
      <p id="note">Ready in this HTML document.</p>
    `;
    document.querySelector('#save')?.addEventListener('click', () => {
      const note = document.querySelector('#note');
      if (note) note.textContent = 'Saved in this HTML document.';
    });
  }
}
