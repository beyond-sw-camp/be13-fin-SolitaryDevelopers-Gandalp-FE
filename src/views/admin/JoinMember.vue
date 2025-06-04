<template>

  <div class="join-page">



  <div class="title-container">
    <h2 class="title">계정 생성</h2>
  </div>


  <v-card class="join-content-card">

        <div class="join-box">



     <!-- 계정 생성-->
        <div class="select-job">
<!--          <label class="radio-box">-->
<!--            <input type="radio" name="type" value="PARAMEDIC" v-model="type">-->
<!--            <span class="box-label">구급대원</span>-->
<!--          </label>-->

          <label class="radio-box">
            <input type="radio" name="type" value="HEAD_NURSE" v-model="type">
            <span class="box-label">수간호사</span>
          </label>

          <label class="radio-box">
            <input type="radio" name="type" value="NURSE" v-model="type">
            <span class="box-label">간호사</span>
          </label>

        </div>

        <div class="member-input">

          <label class="hospital-label" :class="{ disabled: isParamedic }">
            <span class="hospital-label">병원</span>
            <input type="text" v-model="hospital" :disabled="isParamedic" placeholder="병원명을 입력하세요">
          </label>

          <label class="department-label" :class="{ disabled: isParamedic }">
            <span class="department-label">진료과</span>
            <input type="text" v-model="department" :disabled="isParamedic" placeholder="진료과를 입력하세요" />
          </label>

          <label class="name-label">
            <span class="name-label">아이디</span>
            <input type="text" v-model="accountId"
                   required
                   :placeholder="isParamedic
                  ? 'ID 를 입력하세요 (구급대원 예시 : 동작소방서1호차)'
                  : 'ID 를 입력하세요'"
            />
          </label>

          <label class="password-label">
            <span class="password-label">비밀번호</span>
            <input type="password" v-model="password"
                   required
                   placeholder="비밀번호 4자리를 입력하세요" />
          </label>

        </div>


        <div class="btn-box">
          <v-btn  size="small" variant="tonal" color="primary" @click="enroll">등록</v-btn>
        </div>

        <div v-if="message" :class="['alert', success ? 'success' : 'error']">
          {{ message }}
        </div>

        </div>

      </v-card>


  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/axios.js'

const type = ref('HEAD_NURSE')
const hospital = ref('')
const accountId = ref('')
const password = ref('')
const department = ref('')
const message = ref('')
// PARAMEDIC인지 확인
//const isParamedic = computed(() => type.value === 'PARAMEDIC')
const success = ref(false)


// 타입 변경 시 폼 초기화
watch(type, () => {
  hospital.value = ''
  department.value = ''
  accountId.value = ''
  password.value = ''
  message.value = ''
  success.value = false
})

const enroll = async() =>{

  if (!accountId.value || !password.value) {
    alert('아이디와 비밀번호를 모두 입력해주세요.')
    return
  }

  try{
     await apiClient.post('/auth/join',{

      type : type.value,
      hospital : hospital.value,
      department : department.value,
      accountId : accountId.value,
      password: password.value
    })

    message.value = '계정 생성이 완료되었습니다'
    success.value = true

  }catch(err){
    message.value = err.response?.data?.message || "계정을 생성할 수 없습니다";
    success.value = false
  }

};


</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap');


.join-page{
  height: 100vh;
}
h2.title {
  border-bottom: none !important;
  box-shadow: none !important;
  color: #000 !important;
}
h2.title::after,
h2.title::before {
  display: none !important;
}

.title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 25px;
  color: black;
}


.member-input label.disabled input {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.join-content-card {
  width: 75.6vw;
  margin-left: 25px;
  min-height: 480px;
  background-color: white;
  padding: 40px 60px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  gap: 20px;
}

.join-box{
  width: 600px;
}

/* 2) 라디오 버튼 */
.select-job {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.radio-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  /* input 숨기기 */
  input {
    display: none;
  }

  /* label 텍스트 스타일 */
  .box-label {
    padding: 5px 11px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }

  /* 선택된 라디오의 + sibling 으로 붙어 있는 .box-label 스타일 */
  input:checked + .box-label {
    background: #8cbacf;
    color: #fff;
    border-color: #8cbacf;
  }
}

/* 3) 그리드 폼: 첫/마지막은 전체폭, 중간 2개는 1열씩 */
.member-input {
  display: grid;
  grid-template-columns: 1fr;  /* 한 열 */
  gap: 16px;
  margin-bottom: 24px;

  /* 더 이상 nth-child override 불필요 */
  /* > label:nth-child(1),
     > label:nth-child(4) {
     grid-column: 1 / -1;
   } */

  label {
    display: flex;
    flex-direction: column;

    span {
      margin-bottom: 4px;
      font-weight: 500;
    }

    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;

      &:focus {
        outline: none;
        border-color: #1b9aaa;
      }
    }
  }
}

/* 4) 버튼 영역 */
.btn-box {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  button {
    min-width: 70px;
    height: 32px;
    font-size: 0.95rem;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #bfc7cc;
    }
  }
}

.alert {
  margin-top: 16px;
  font-size: 14px;
  user-select: none;
}

.alert.success {
  color : green;
}
.alert.error {
  color : red;
}
</style>
