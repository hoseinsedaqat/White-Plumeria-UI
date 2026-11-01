import '@white-plumeria/styles';
import { Alert, Badge, Button, Card, Input, Switch } from '@white-plumeria/ember';
import { renderComponent } from '@ember/renderer';
import { readPenComponent } from '../../component.ts';

const app = document.querySelector('#app');
const component = readPenComponent();
if (app instanceof HTMLElement) {
  const host = document.createElement('div');
  app.replaceChildren(host);
  if (component === 'badge') {
    renderComponent(Badge as never, { into: host, args: { variant: 'success', label: 'Paid' } });
  } else if (component === 'alert') {
    renderComponent(Alert as never, {
      into: host,
      args: { variant: 'info', title: 'Info', description: 'Sample notice.' },
    });
  } else if (component === 'card') {
    renderComponent(Card as never, {
      into: host,
      args: { title: 'Ledger', description: 'A titled surface.' },
    });
  } else if (component === 'switch') {
    renderComponent(Switch as never, { into: host, args: { label: 'Enabled', checked: true } });
  } else if (component === 'input') {
    renderComponent(Input as never, {
      into: host,
      args: { label: 'Email', placeholder: 'ada@example.com' },
    });
  } else {
    const note = document.createElement('p');
    note.id = 'note';
    note.textContent = 'Ready in this Ember document.';
    app.append(note);
    app.addEventListener('wpl-click', () => {
      note.textContent = 'Saved in this Ember document.';
    });
    renderComponent(Button as never, { into: host, args: { label: 'Save changes' } });
  }
}
