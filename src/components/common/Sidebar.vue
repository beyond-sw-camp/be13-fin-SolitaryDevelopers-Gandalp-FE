<template>
  <div class="sidebar">
      <div class="logo">간&nbsp;달&nbsp;프</div>
    <h4>📌 <strong>공지사항</strong></h4>
    <div class="notice-box">
      <div class="notice-content">
        <p>간달프 시스템 점검 예정</p>
        <p>29일 10시 수술실 예약 마감</p>
        <p>5월 1일 근무자 일정 업데이트</p>
        <p>5월 1일 근무자 일정 업데이트</p>
        <p>5월 1일 근무자 일정 업데이트</p>
        <p>5월 1일 근무자 일정 업데이트</p>
        <p>5월 1일 근무자 일정 업데이트</p>
        <p>5월 1일 근무자 일정 업데이트</p>
      </div>
    </div>

    <div class="legend">
      <h4>👩‍⚕️ <strong>근무 현황</strong></h4>
      <ul>
        <li><span class="dot pink"></span> 간호사 A</li>
        <li><span class="dot blue"></span> 간호사 B</li>
        <li><span class="dot green"></span> 간호사 C</li>
        <li><span class="dot gray"></span> 간호사 D</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 240px;
  padding: 16px;
  background: linear-gradient(180deg, #ADDDF9 34%, #C2EBFF 67%);
  border-right: 1px solid #ccc;
  height: calc(100vh - 60px);
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-box {
  background-color: #f4f4f4;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-height: 200px; 
  overflow-y: auto;
}
.notice-content p {
  margin: 4px 0;
}

.legend ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.legend li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}
.pink { background-color: #f48fb1; }
.blue { background-color: #90caf9; }
.green { background-color: #a5d6a7; }
.gray { background-color: #b0bec5; }
</style>
