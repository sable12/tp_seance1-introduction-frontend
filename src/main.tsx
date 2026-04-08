import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Provider } from 'react-redux';
import { store } from './store';
createRoot(document.getElementById('root')!).render(
 <StrictMode>
 <BrowserRouter>
 <Provider store={store}>
 <App />
 </Provider>
 </BrowserRouter>
 </StrictMode>
);
