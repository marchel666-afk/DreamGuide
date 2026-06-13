import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Polyfill Telegram WebApp for browser demo
if (!window.Telegram) {
  (window as any).Telegram = {
    WebApp: {
      initData: '',
      initDataUnsafe: { user: { id: 123, first_name: 'Андрей', username: 'andrey_demo' } },
      colorScheme: 'dark',
      themeParams: {},
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      expand: () => {},
      close: () => {},
      ready: () => {},
      showAlert: (msg: string) => alert(msg),
      showConfirm: (msg: string, cb: (ok: boolean) => void) => cb(confirm(msg)),
      MainButton: { text: '', show: () => {}, hide: () => {}, enable: () => {}, disable: () => {}, showProgress: () => {}, hideProgress: () => {}, onClick: () => {}, offClick: () => {}, setParams: () => {} },
      BackButton: { isVisible: false, show: () => {}, hide: () => {}, onClick: () => {}, offClick: () => {} },
      HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {}, selectionChanged: () => {} },
    },
  };
}

window.Telegram?.WebApp?.expand();
window.Telegram?.WebApp?.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
