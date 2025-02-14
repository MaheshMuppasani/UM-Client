import React, { createContext, useContext, useState } from "react";
import { getRole } from "./axios";
import { Redirect } from 'react-router-dom';
const UserRoleContext = createContext();

// Custom Hook for Convenience
export const useUserRole = () => {
  return useContext(UserRoleContext);
};

// Provider Component
export const UserRoleProvider = ({ children }) => {
  // State to Store User Role
  const [userRole, setUserRole] = useState(getRole());

  const isStudent = () => userRole == 1;
  const isFaculty = () => userRole == 2;
  const isAdmin = () => userRole == 3;

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, isStudent, isFaculty, isAdmin }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const RoleBasedRoute = ({ rolesToComponents, ...forwardProps }) => {
  const { userRole } = useUserRole();
  if(!userRole) return <Redirect to="/login" />
  const Component = rolesToComponents[userRole] || null;
  return Component ? <Component {...forwardProps}/> : <Redirect to="/unauthorized" />;
};
