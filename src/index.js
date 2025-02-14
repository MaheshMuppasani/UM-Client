import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastProvider } from './AppToast';
import { UserRoleProvider } from './userRole';
import { AppConstantsProvider } from './constantsProvider';
import { GlobalListenerProvider } from './GlobalListenerProvider';
// import 'bootstrap/dist/js/bootstrap.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalListenerProvider>
      <UserRoleProvider>
        <AppConstantsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppConstantsProvider>
      </UserRoleProvider>
    </GlobalListenerProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
