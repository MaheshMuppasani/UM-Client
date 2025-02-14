import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login page/login';
import RegisterStudent from './components/Student/studentRegistration';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppMainPage, { PageNotFound, RedirectToDefaultPage } from './components/app-main-page';
import axiosInstance from "../src/axiosInstance.js";
import { Redirect } from 'react-router-dom';
import { URLS } from './assets/urlConstants.js';
import { useConstants } from './constantsProvider.js';

function App() {

  const { setAppConstants } = useConstants();

  useEffect(() => {
    axiosInstance.get(URLS.getAllConstants)
      .then(data => {
        setAppConstants(data.data)
      })
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
