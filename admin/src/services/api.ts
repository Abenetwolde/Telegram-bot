import axios from 'axios';

// Define the base URL based on the environment
const baseURL =  process.env.DURL 
console.log("baseURL",baseURL)
const api = axios.create({
  baseURL:baseURL,
});

export default api;
