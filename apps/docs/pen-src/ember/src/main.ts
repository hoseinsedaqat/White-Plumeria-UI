import '@white-plumeria/styles';
import { Button } from '@white-plumeria/ember';
import { renderComponent } from '@ember/renderer';

const app = document.querySelector('#app');
if (app instanceof HTMLElement) {
  const host = document.createElement('div');
  const note = document.createElement('p');
  note.id = 'note';
  note.textContent = 'Ready in this Ember document.';
  app.replaceChildren(host, note);
  app.addEventListener('wpl-click', () => {
    note.textContent = 'Saved in this Ember document.';
  });
  renderComponent(Button as never, {
    into: host,
    args: { label: 'Save changes' },
  });
}
