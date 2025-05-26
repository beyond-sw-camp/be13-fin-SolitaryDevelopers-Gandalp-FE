import router from '@/router';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timhCredentials: true // refreshCookie 받아야 하니까 true 로 설정 
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

// 응답 인터셉터 : 401 처리
apiClient.interceptors.response.use(
  response => response,
  error => {

    const status = error.response?.status;

    if( status === 400 || status === 401){
      // 로그인이 안된 상태 -> 로그인 페이지로 이동 
      router.push('/login')
    }
    return Promise.reject(error);
  }
)

// 응답 인터셉터 : 401 처리
apiClient.interceptors.response.use(
  response => response,
  error => {

    const status = error.response?.status;

    if( status === 400 || status === 401){
      // 로그인이 안된 상태 -> 로그인 페이지로 이동 
      router.push('/login')
    }
    return Promise.reject(error);
  }
)

export default apiClient; // ✅ 만들어놓은 인스턴스를 export