import React from "react"
import { useEffect, useState } from 'react';
import SideNav from './sidenav/sidenav.js';
import StudentProfile from './Student/StudentProfile.js';
import axios from "../axiosInstance.js";
import { useHistory } from "react-router-dom";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import StudentEnrollment from './Student/studentEnrollment.js';
import StudentCourses from './Student/studentCourses.js';
import FacultyProfile from './Faculty/facultyProfile.js';
import FacultyCourses from './Faculty/facultyCourses.js';
import { RoleBasedRoute, useUserRole } from '../userRole.js';
import { URLS } from '../assets/urlConstants.js';
import AdminProgramsPage from './Admin/programs/adminProgramsPage.js';
import { AdminIcon, FacultyIcon, StudentIcon } from '../assets/constants.js';
import AdminCourseRouter from './Admin/course/adminCourseRouter.js';
import AdminFacultyRouter from './Admin/faculty/admin.faculty.router.js';
import CalendarPage from "./Calendar/Calendar.js";
import AdminDashboard from "./Admin/dashboard/dashboard.js";
import { useConstants } from "../constantsProvider.js";

export const PageNotFound = ({text}) => {
  return <h1>{text || "404 Page Not Found"}</h1>;
};

export const RedirectToDefaultPage = () => {
  const history = useHistory();

  const { isAdmin } = useUserRole();
  if(isAdmin()) {
    history.push("/dashboard")
  } else{
    history.push("/profile")
  }
  return null;
}

const AppMainPage = (props) => {
  const history = useHistory();
  const [profile, setProfile] = useState({});
  const [isSideNavOpen, setSideNavOpen] = useState(true);
  const { userRole, setUserRole, isFaculty, isAdmin, isStudent } = useUserRole();

  const { setAppConstants } = useConstants();
  
  const toggleSideNav = () => {
    setSideNavOpen(prev => !prev);
  };

  const roleBasedUserIcon = () => {
    if(isStudent()) return <StudentIcon />
    if(isFaculty()) return <FacultyIcon />
    if(isAdmin()) return <AdminIcon />
  }  

  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    history.push('/login')
  }

  useEffect(() => {
    if (userRole) {
      axios.get(URLS.userME)
      .then(data => {
          setProfile(data.data);
        }).catch(err => {
          history.push("/login")
        })
      axios.get(URLS.getAllConstants).then(data => {
        setAppConstants(data.data);
      })
    } else {
      history.push("/login")
    }
  }, [])

  const shortName = profile && profile.FirstName && profile.LastName && profile.FirstName[0].toUpperCase() + profile.LastName[0].toUpperCase();

  return (
    <div className='app-root'>
      <nav className="app-header navbar navbar-expand-lg py-2">
        <div className="container-fluid">
          <div className='d-flex align-items-center gap-4'>
            <button className='burger btn d-flex flex-column row-gap-1 p-2 border-0' onClick={toggleSideNav}>
              <div></div>
              <div></div>
              <div></div>
            </button>
            <h2>
              <a className="navbar-brand text-white fs-3" href="/">Horizon University</a>
            </h2>
          </div>
          <div className='d-flex align-items-center column-gap-1'>
            <span className='profileRole'>{roleBasedUserIcon(profile.role)}</span>
            {
              profile && profile.FirstName && <h5 className='m-0 mx-2'>Welcome, {profile.FirstName}</h5>
            }
            <button className='profile-icon btn rounded-circle border btn-secondary px-0 fs-5'>{shortName ? shortName : ''}</button>

          </div>
        </div>
      </nav>
      <div className='app-container d-flex'>
        <SideNav logOut={logout} isOpen={isSideNavOpen} />
        <div className={`app-container-body ${isSideNavOpen ? '' : 'expanded'}`}>
          <Switch>
            <Route path='/profile'>
              <RoleBasedRoute rolesToComponents={{1: StudentProfile, 2: FacultyProfile, 3: FacultyProfile}} />
            </Route>
            <Route path='/enrollments'>
              <RoleBasedRoute rolesToComponents={{1: StudentEnrollment}} />
            </Route>
            <Route path='/courses'>
              <RoleBasedRoute rolesToComponents={{1: StudentCourses, 2: FacultyCourses, 3: AdminCourseRouter}} />
            </Route>
            <Route path='/programs'>
              <RoleBasedRoute rolesToComponents={{3: AdminProgramsPage}} />
            </Route>
            <Route path='/faculty'>
              <RoleBasedRoute rolesToComponents={{3: AdminFacultyRouter}} />
            </Route>
            <Route path='/dashboard'>
              <RoleBasedRoute rolesToComponents={{3: AdminDashboard}} />
            </Route>
            <Route path="/calendar">
              <CalendarPage />
            </Route>
            <Route path="/" exact><RedirectToDefaultPage /></Route>
            <Route path="/unAuthorized"><PageNotFound text={"401 Access Denied"} /></Route>
            <Route path="*" ><PageNotFound /></Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default AppMainPage;