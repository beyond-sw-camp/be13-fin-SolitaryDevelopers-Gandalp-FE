import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 1000,
  withCredentials: true
});

export default apiClient; // ✅ 만들어놓은 인스턴스를 exportpm