<template>
  <div class="sidebar">
    <div class="logo">간&nbsp;달&nbsp;프</div>

    <div class="notice-section">
      <h4 class="notice-title">📌 공지사항</h4>
      <div class="notice-box">
        <div class="notice-content">
          <p>간달프 시스템 점검 예정</p>
          <p>29일 10시 수술실 예약</p>
          <p>5월 1일 근무자 일정 업데이트</p>
          <p>5월 1일 근무자 일정 업데이트</p>
          <p>5월 1일 근무자 일정 업데이트</p>
          <p>5월 1일 근무자 일정 업데이트</p>
          <p>5월 1일 근무자 일정 업데이트</p>
          <p>5월 1일 근무자 일정 업데이트</p>
        </div>
      </div>
    </div>

    <div class="status-section">
      <h4 class="status-title">👩‍⚕️ 근무 현황</h4>
      <ul class="status-list">
        <li>
          <span class="nurse-name">간호사1</span>
          <span class="dot pink"></span>
          <span class="status-text">수술 중</span>
        </li>
        <li>
          <span class="nurse-name">간호사2</span>
          <span class="dot blue"></span>
          <span class="status-text">근무 중</span>
        </li>
        <li>
          <span class="nurse-name">간호사3</span>
          <span class="dot blue"></span>
          <span class="status-text">근무 중</span>
        </li>
        <li>
          <span class="nurse-name">간호사4</span>
          <span class="dot gray"></span>
          <span class="status-text">오프</span>
        </li>
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

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.notice-section,
.status-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-title,
.status-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
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
  line-height: 1.4;
  font-size: 12px;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
  padding-left: 25px;
}

.nurse-name {
  font-weight: bold;
  margin-right: 10px;
  min-width: 50px;
  color: #545454;
}

.status-text {
  font-size: 14px;
  color: #584e4e;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.pink { background-color: #f48fb1; }
.blue { background-color: #64b5f6; }
.gray { background-color: #b0bec5; }
</style>
