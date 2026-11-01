import '@white-plumeria/styles';
import { Alert, Badge, Button, Card, Input, Switch } from '@white-plumeria/vue';
import { createApp, h, ref } from 'vue';
import { readPenComponent } from '../../component.ts';

const component = readPenComponent();
const saved = ref('Ready in this Vue document.');

createApp({
  setup() {
    return () => {
      if (component === 'badge') return h(Badge, { variant: 'success' }, () => 'Paid');
      if (component === 'alert')
        return h(Alert, { variant: 'info', title: 'Info' }, () => 'Sample notice.');
      if (component === 'card')
        return h(Card, { title: 'Ledger', description: 'A titled surface.' });
      if (component === 'switch') return h(Switch, { label: 'Enabled', modelValue: true });
      if (component === 'input')
        return h(Input, { placeholder: 'ada@example.com', 'aria-label': 'Email' });
      return h('main', { class: 'wpl-root wpl-reset' }, [
        h(
          Card,
          {
            title: 'Vue',
            description: 'A Vue render function. The docs page does not render this button.',
          },
          {
            default: () => [
              h(
                Button,
                {
                  onClick: () => {
                    saved.value = 'Saved in this Vue document.';
                  },
                },
                () => 'Save changes',
              ),
              h('p', { id: 'note' }, saved.value),
            ],
          },
        ),
      ]);
    };
  },
}).mount('#app');
