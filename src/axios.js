import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

// App loader state manager
const loadingState = {
  count: 0,
  listeners: new Set(),
  isLoading: false,
  
  start() {
    this.count++;
    this.updateState();
  },
  
  stop() {
    this.count = Math.max(0, this.count - 1);
    this.updateState();
  },
  
  updateState() {
    const wasLoading = this.isLoading;
    this.isLoading = this.count > 0;
    
    if (wasLoading !== this.isLoading) {
      this.notifyListeners();
    }
  },
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isLoading));
  }
};

export const getToken = () => localStorage.getItem("access_token") || null;
export const getRole = () => localStorage.getItem("role") || null;
export const getAuthorizationHeader = () => `Bearer ${getToken()}`;

// Allow components to subscribe to the loading state
export const appLoader = {
  subscribe: (callback) => loadingState.subscribe(callback),
  get isLoading() {
    return loadingState.isLoading;
  }
};

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL,
    headers: { Authorization: getAuthorizationHeader() },
  });

  instance.interceptors.request.use(
    (reqConfig) => {
      reqConfig.headers = {...reqConfig.headers, Authorization: getAuthorizationHeader()};
      loadingState.start();
      return reqConfig;
    },
    (err) => {
      loadingState.stop();
      return Promise.reject(err);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      loadingState.stop();
      return response;
    },
    (err) => {
      loadingState.stop();
      return Promise.reject({ ...err }.response);
    }
  );
  
  return instance;
};

export default getAxiosInstance();