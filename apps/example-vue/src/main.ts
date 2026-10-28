import '@white-plumeria/styles';
import { Button, Card, WhitePlumeriaProvider } from '@white-plumeria/vue';
import { createApp, h } from 'vue';

createApp({
  render() {
    return h(WhitePlumeriaProvider, () =>
      h('main', { class: 'wpl-root wpl-reset', style: { padding: '2rem' } }, [
        h(Card, { title: 'Vue example', description: 'This card is the real component, not a mock.' }, () =>
          h(Button, { onClick: () => (document.title = 'Saved · White Plumeria') }, () => 'Save changes'),
        ),
      ]),
    );
  },
}).mount('#app');
