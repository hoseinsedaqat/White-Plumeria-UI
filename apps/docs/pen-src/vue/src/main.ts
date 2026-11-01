import '@white-plumeria/styles';
import { Button, Card } from '@white-plumeria/vue';
import { createApp, h, ref } from 'vue';

const saved = ref('Ready in this Vue document.');

createApp({
  setup() {
    return () =>
      h('main', { class: 'wpl-root wpl-reset' }, [
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
  },
}).mount('#app');
