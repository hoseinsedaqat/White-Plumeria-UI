import '@white-plumeria/styles';

const app = document.querySelector('#app');
if (app) {
  app.innerHTML = `
    <button class="wpl-btn wpl-btn-primary" type="button" id="save">Save changes</button>
    <p id="note">Ready in this HTML document.</p>
  `;
  document.querySelector('#save')?.addEventListener('click', () => {
    const note = document.querySelector('#note');
    if (note) note.textContent = 'Saved in this HTML document.';
  });
}
