import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login page/login';
import RegisterStudent from './components/Student/studentRegistration';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import AppMainPage, { RedirectToDefaultPage } from './components/app-main-page.js';
import axiosInstance from "../src/axiosInstance.js";
import { URLS } from './assets/urlConstants.js';
import { useConstants } from './constantsProvider.js';
import { useToast } from './AppToast.js';
import { feedBackType, userFeedback } from './assets/constants.js';
import AppLoader from './app-loader.js';

function AppContainer() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function UnSupportedDeviceTemplate() {
  const history = useHistory();
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      history.push('/');
    }
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '20%', fontFamily: 'Arial' }}>
      <h1>🚧 Desktop-Only Website</h1>
      <p>This platform is optimized for desktop. Please visit from a computer for the best experience.</p>
      <p>Mobile support will be added soon!</p>
      <p><a href="https://github.com/MaheshMuppasani/UM-Server">Check out the code on GitHub</a></p>
    </div>
  )
}

function App() {
  const history = useHistory();
  const { setAppConstants } = useConstants();
  const { addToast, clearToast } = useToast();
  const [toastID, setToastID] = useState(null);
  const toastRef = { current: toastID };

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !window.location.pathname.includes('/mobile-not-supported')) {
      history.push('/mobile-not-supported');
    }
  }, [history]);

  useEffect(() => {
    axiosInstance.get(URLS.getAllConstants)
      .then(data => {
        setAppConstants(data.data);
        if (toastRef.current) {
          clearToast(toastRef.current);
          toastRef.current = null;
        }
      }).catch(() => {
        if (!toastRef.current) {
          const id = addToast(userFeedback.databaseError, feedBackType.error, null, false);
          toastRef.current = id;
          setToastID(id);
        }
      });
    return () => {
      if (toastRef.current) clearToast(toastRef.current);
    };
  }, [setAppConstants, addToast, clearToast]);

  return (
    <>
      <AppLoader />    
      <div className="App">
        <Switch>
          <Route path='/login' exact>
            <Login />
          </Route>
          <Route path='/register' exact>
            <RegisterStudent />
          </Route>
          <Route path='/mobile-not-supported' exact>
            <UnSupportedDeviceTemplate />
          </Route>
          <Route path='/'>
            <AppMainPage />
          </Route>
          <Route path="/" exact>
            <RedirectToDefaultPage />
          </Route>
        </Switch>
      </div>
    </>
  );
}

export default AppContainer;