import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL_PREFIX;
console.log(import.meta.env.VITE_BASE_URL_PREFIX, "process.env.VITE_BASE_URL_PREFIX");
export default axios;