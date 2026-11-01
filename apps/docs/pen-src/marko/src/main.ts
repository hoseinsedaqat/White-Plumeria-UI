import '@white-plumeria/styles';
import App from './pen.marko';

const root = document.querySelector('#app');
if (root) App.mount({}, root);
