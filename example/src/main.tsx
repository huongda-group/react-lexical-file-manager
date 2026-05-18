import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { worker } from './mock-server';

function mount(): void {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

let mounted = false;

const timer = setTimeout(() => {
  if (!mounted) {
    mounted = true;
    mount();
  }
}, 3000);

worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
  if (!mounted) {
    mounted = true;
    clearTimeout(timer);
    mount();
  }
}).catch(() => {
  if (!mounted) {
    mounted = true;
    clearTimeout(timer);
    mount();
  }
});
