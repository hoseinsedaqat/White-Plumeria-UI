import { component$ } from '@qwik.dev/core';
import { QwikCityProvider, RouterOutlet } from '@qwik.dev/router';

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Qwik City desk · White Plumeria</title>
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
