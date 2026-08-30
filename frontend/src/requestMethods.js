import axios from "axios";

const BASE_URL = "http://localhost:8000/api/";

export const pf = "http://localhost:8000/images";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});
