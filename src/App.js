import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login page/login';
import RegisterStudent from './components/Student/studentRegistration';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppMainPage, { PageNotFound, RedirectToDefaultPage } from './components/app-main-page';
import axiosInstance from "../src/axiosInstance.js";
import { URLS } from './assets/urlConstants.js';
import { useConstants } from './constantsProvider.js';
import { useToast } from './AppToast.js';
import { feedBackType, userFeedback } from './assets/constants.js';

function App() {

  const { setAppConstants } = useConstants();
  const { addToast, clearToast } = useToast();
  const [toastID, setToastID] = useState(null);
  const toastRef = { current: toastID };


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
      })
    return () => {
      if (toastRef.current) clearToast(toastRef.current)
    }
  }, [])

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path='/login' exact>
            <Login />
          </Route>
          <Route path='/register' exact>
            <RegisterStudent />
          </Route>
          <Route path='/'>
            <AppMainPage />
          </Route>
          <Route path="/" exact><RedirectToDefaultPage /></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
