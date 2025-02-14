import axios from 'axios';

const baseURL = "https://um-server-one.vercel.app/";

export const getToken = () => localStorage.getItem("access_token") || null;

export const getRole = () => localStorage.getItem("role") || null;

export const getAuthorizationHeader = () => `Bearer ${getToken()}`;

const getAxiosInstance = () => {
    const instance = axios.create({
        baseURL,
        headers: { Authorization: getAuthorizationHeader() },
      });

    instance.interceptors.request.use(
        (reqConfig) => {
            reqConfig.headers = {...reqConfig.headers, Authorization: getAuthorizationHeader()}
            return reqConfig;
        },
        (err) => {
            return Promise.reject(err);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (err) => {
            return Promise.reject({ ...err }.response);
        }
    );
    return instance;
};

export default getAxiosInstance();