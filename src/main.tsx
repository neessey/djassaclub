import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import MobileOnly from './components/MobileOnly.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <MobileOnly> */}
    <App />
        {/* </MobileOnly> */}
  </StrictMode>,
);
