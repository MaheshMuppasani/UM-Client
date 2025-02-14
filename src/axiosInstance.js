import axios from "./axios";

class AxiosInstance {
    constructor() {
        this.axios = axios;
    }

    get(url, config) {
        return this.axios.get(url, config);
    }

    post(url, object, config) {
        return this.axios.post(url, object, config);
    }

    put(url, object, config) {
        return this.axios.put(url, object, config);
    }

    delete(url, config) {
        return this.axios.delete(url, config);
    }
}

export default new AxiosInstance();