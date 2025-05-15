<template>
    <div class="create-nurse-container">
        <h2 class="title">간호사 계정 생성</h2>
        <form @submit.prevent="handleSubmit" class="form-box">
            <div class="form-group">
                <label for="name">이름</label>
                <input id="name" v-model="form.name" type="text" required />
            </div>
            <div class="form-group">
                <label for="email">이메일</label>
                <input id="email" v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
                <label for="password">비밀번호</label>
                <input id="password" v-model="form.password" type="password" required />
            </div>
            <div class="submit-box">
                <button type="submit">등록</button>
            </div>
        </form>
    </div>a
</template>

<script setup>
    import { ref } from 'vue'
    import apiClient from '@/api/axios'

    const form = ref({
    name: '',
    email: '',
    password: '',
    })

    const handleSubmit = async () => {
    try {
        await apiClient.post('/nurses', form.value)
        alert('간호사 계정이 생성되었습니다.')
        form.value = { name: '', email: '', password: '' }
    } catch (err) {
        alert(`생성 실패: ${err.response?.data || err.message}`)
    }
    }
</script>

<style scoped>
.create-nurse-container {
    height: 100vh;
    background: #fff;
    padding: 40px 80px;
}

.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 30px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
}

.form-box {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    align-items: center;
}

.form-group label {
    width: 80px;
    font-weight: 600;
    margin-right: 10px;
}

.form-group input {
    flex: 1;
    max-width: 400px; /* ✅ 최대 너비 제한 추가 */
    width: 100%;       /* flex 상황에서도 꽉 차지 않게 */
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
}


.submit-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.submit-box button {
    background-color: #d6e9f8;
    color: #000;
    font-weight: 600;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background 0.2s;
}

.submit-box button:hover {
    background-color: #c3ddf4;
}
</style>
