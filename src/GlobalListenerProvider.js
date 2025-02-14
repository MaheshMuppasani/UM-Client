import React, { createContext, useEffect } from 'react';

const GlobalListenerContext = createContext();

const GlobalListenerProvider = ({ children }) => {
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'reload') {
                window.location.reload(true);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <GlobalListenerContext.Provider value={{}}>
            {children}
        </GlobalListenerContext.Provider>
    );
};

export { GlobalListenerContext, GlobalListenerProvider };