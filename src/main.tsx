import React from 'react';
import ReactDOM from 'react-dom/client';
import { PlatformRoot } from './platform/PlatformRoot/PlatformRoot';
import './index.css'; // <-- SÄKERSTÄLL ATT DENNA RAD FINNS MED!

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PlatformRoot />
    </React.StrictMode>
);