// ===== 판매자 대시보드 JavaScript =====

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('판매자 대시보드 페이지 로드됨');
  
  // 대시보드 통계 데이터 로드
  loadDashboardData();
  
  // 이벤트 리스너 설정
  setupEventListeners();
});

// 대시보드 데이터 로드
function loadDashboardData() {
  // 현재는 서버에서 렌더링된 데이터를 사용
  // 향후 AJAX로 실시간 데이터 업데이트 가능
  console.log('대시보드 데이터 로드 완료');
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 판매 목록 버튼
  const salesListBtn = document.querySelector('button[onclick*="seller/list"]');
  if (salesListBtn) {
    salesListBtn.addEventListener('click', function() {
      console.log('판매 목록 페이지로 이동');
    });
  }
  
  // 판매 상품 등록 버튼
  const addProductBtn = document.querySelector('button[onclick*="seller/add"]');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', function() {
      console.log('판매 상품 등록 페이지로 이동');
    });
  }
}

// 페이지 통계 수집
function trackPageView() {
  console.log('판매자 대시보드 페이지 조회');
  // Google Analytics나 다른 분석 도구 연동 가능
}

// 페이지 로드 완료 후 통계 수집
setTimeout(() => {
  trackPageView();
}, 1000);
