import App from './app.marko';
import '@white-plumeria/styles';
import './desk.css';

const root = document.querySelector('#app');
if (root) App.mount({}, root);
