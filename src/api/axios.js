import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 1000,
  withCredentials: true
});

// 인터셉터 추가 - 요청시 토큰 자동 포함
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error);
})

export default apiClient; // ✅ 만들어놓은 인스턴스를 export