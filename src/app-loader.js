import { useEffect, useState } from 'react';
import { appLoader } from './axios';
import './appLoader.css';

const AppLoader = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return appLoader.subscribe((loading) => {
      setIsLoading(loading);
    });
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loader-backdrop">
      <div className="loader-container">
        {/* <div className="spinner"></div> */}
        <div className="bouncing-dots">
          <div className="dot" style={{ '--delay': '0s' }}></div>
          <div className="dot" style={{ '--delay': '0.2s' }}></div>
          <div className="dot" style={{ '--delay': '0.4s' }}></div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default AppLoader;