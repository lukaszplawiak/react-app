import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App';
import store from './store';
import ErrorBoundary from './common/ErrorBoundary/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Ensure index.html contains <div id="root">.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);