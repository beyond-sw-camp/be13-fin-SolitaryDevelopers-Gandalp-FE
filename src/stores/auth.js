// store = pinia 가 api 전역 상태를 관리하는 공간 
// 컴포넌트끼리 공유해야 하는 데이터를 store에 두고, 모든 컴포넌트에서 접근이 가능하다.

import apiClient from "@/api/axios";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";


export const useAuthStore = defineStore('auth', () => {
    
    // 페이지 이동하기 위해서 router를 추가.
    const router = useRouter();

    // 로그인 상태 저장 
    const isLoggedIn = ref(false);

    // 사용자 정보 저장
    const userInfo = reactive({
        username: '',
        type: ''
    });

    const login = async (loginData) => {
        try{
            const response = await apiClient.post('/auth/login', loginData);

            // login 성공 했을 경우
            if(response.status === 200){

                const parseToken = parseJwt(response.data.accessToken);
                
                localStorage.setItem('accessToken', response.data.accessToken);

                isLoggedIn.value = true;

                // 토큰에서 사용자 정보 추출
                userInfo.username = parseToken.username;
                userInfo.type = parseToken.type;

                localStorage.setItem('user', JSON.stringify({username: parseToken.username }));

                console.log('username: ', userInfo.username);
                console.log('type: ', userInfo.type);
                router.push({name: 'home'})

            }

        }catch (e){
            console.log('error: ', e);

            // 서버에서 에러 메시지를 보냈다면 그걸 alert에 출력
            if (e.response && e.response.data) {
                alert(e.response.data);
            } else {
                alert('알 수 없는 오류가 발생했습니다.');
            }
        }        
    }

    // 새로고침시 Pinia 상태가 초기화되므로 로그인 유지를 위해서 추가 
    const checkLogin = () => {

        const accessToken = localStorage.getItem('accessToken');
        if(accessToken){
            const parseToken = parseJwt(accessToken);
            userInfo.username = parseToken.username;
            userInfo.type = parseToken.type;
            isLoggedIn.value = true;
        }else{
            isLoggedIn.value = false;
        }
    };

    const logout = async () => {

        try{
            const accessToken = localStorage.getItem('accessToken');

            if(isInvalidAccessToken(accessToken)){
                alert('다시 로그인 해주세요');

                logoutUser();
                return;
            }

            const response = await apiClient.post('/auth/logout', {},{headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }})

            console.log('response: ', response);
            if(response.status === 200){
                logoutUser();
            }

        }catch(e){
            console.log(e);

            alert('에러가 발생했습니다.');
        }

    };


    const parseJwt = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            
            return JSON.parse(jsonPayload)


        }catch(e) {
            return null;
        }
    }

    const logoutUser = () => {
        // 토큰들을 로컬 스토리지에서 삭제 
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // 로그인 상태 변경 
        isLoggedIn.value = false;

        // 사용자 정보를 지우기
        userInfo.username = '';
        userInfo.type = '';

        // 로그인 페이지로 리다이렉트 
        router.push({name: 'login'});
    }

    // 엑세스 토큰 유효 검사 
    const isInvalidAccessToken = (token) => {
        try {
            const decoded = parseJwt(token);
            const currentTime = Math.floor(Date.now() / 1000);

            return decoded.exp <= currentTime;
        
        }catch (e){
            return false;
        }
    }
    



    return { isLoggedIn , login , logout ,isInvalidAccessToken , logoutUser , parseJwt, checkLogin, userInfo }


})