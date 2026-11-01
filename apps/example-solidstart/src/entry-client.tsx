import { render } from 'solid-js/web';
import Home from './routes/index';

// The framed file is index.html. StartClient hydrates the handler shell and
// does not match that URL, so the desk mounts the Solid route directly.
const root = document.getElementById('app');
if (root) {
  root.replaceChildren();
  render(() => <Home />, root);
}
