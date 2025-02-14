import React, { createContext, useContext, useState } from "react";
const ConstantsContext = createContext();

// Custom Hook for Convenience
export const useConstants = () => {
  return useContext(ConstantsContext);
};

// Provider Component
export const AppConstantsProvider = ({ children }) => {
  // State to Store User Role
  const [appConstants, setAppConstants] = useState({}); // Default is `null`, can be `student`, `faculty`, etc.

  return (
    <ConstantsContext.Provider value={{ constants: appConstants, setAppConstants }}>
      {children}
    </ConstantsContext.Provider>
  );
};