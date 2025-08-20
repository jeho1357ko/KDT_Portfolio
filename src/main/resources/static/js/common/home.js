/**
 * 홈페이지 JavaScript 모듈
 * 검색, 이미지 오류 처리, 인기상품 슬라이더 기능을 담당
 */

// ===== 검색 관련 함수 =====

/**
 * 검색 실행 함수
 * 검색어를 입력받아 검색 결과 페이지로 이동
 */
function goSearch() {
  const keyword = document.getElementById('searchKeyword').value.trim();
  
  if (keyword) {
    // 검색 결과 페이지로 키워드를 쿼리 스트링으로 넘김
    window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
  } else {
    alert('검색어를 입력하세요.');
  }
}

// ===== 이미지 오류 처리 함수 =====

/**
 * 이미지 로드 실패 처리
 * @param {HTMLImageElement} img - 오류가 발생한 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '이미지 불러오는데 실패했습니다';
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('.product-card') || img.parentElement;
  if (container) {
    showImageErrorMessage(container);
  }
}

/**
 * 이미지 오류 메시지 표시
 * @param {HTMLElement} container - 메시지를 표시할 컨테이너
 */
function showImageErrorMessage(container) {
  // 기존 오류 메시지가 있는지 확인
  let errorMessage = container.querySelector('.image-error-message');
  
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.className = 'image-error-message';
    errorMessage.textContent = '이미지 불러오는데 실패했습니다';
    
    // 이미지 컨테이너에 상대 위치 설정
    const imageContainer = container.querySelector('img').parentElement;
    if (imageContainer) {
      imageContainer.style.position = 'relative';
      imageContainer.appendChild(errorMessage);
      
      // 3초 후 메시지 숨기기
      setTimeout(() => {
        hideImageErrorMessage(errorMessage);
      }, 3000);
    }
  }
}

/**
 * 이미지 오류 메시지 숨기기
 * @param {HTMLElement} errorMessage - 숨길 오류 메시지 요소
 */
function hideImageErrorMessage(errorMessage) {
  if (errorMessage && errorMessage.parentElement) {
    errorMessage.style.opacity = '0';
    errorMessage.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      if (errorMessage && errorMessage.parentElement) {
        errorMessage.remove();
      }
    }, 500);
  }
}

// ===== 인기상품 슬라이더 관련 함수 =====

/**
 * 슬라이더 이동 (이전/다음)
 * @param {number} direction - 이동 방향 (-1: 이전, 1: 다음)
 */
function movePopularSlider(direction) {
  const currentPage = window.currentPopularPage || 0;
  goToPopularPage(currentPage + direction);
}

/**
 * 특정 페이지로 이동
 * @param {number} pageIndex - 이동할 페이지 인덱스
 */
function goToPopularPage(pageIndex) {
  const slider = document.getElementById('popularSlider');
  if (!slider) return;
  
  const pages = slider.querySelectorAll('.popular-page');
  const pageCount = pages.length;
  
  // 페이지 인덱스 범위 조정
  if (pageIndex < 0) {
    pageIndex = pageCount - 1; // 마지막 페이지로
  } else if (pageIndex >= pageCount) {
    pageIndex = 0; // 첫 페이지로
  }
  
  window.currentPopularPage = pageIndex;
  updateSliderPosition();
  updateDots();
}

/**
 * 슬라이더 위치 업데이트
 */
function updateSliderPosition() {
  const slider = document.getElementById('popularSlider');
  if (!slider) return;
  
  const track = slider.querySelector('.popular-track');
  const currentPage = window.currentPopularPage || 0;
  
  track.style.transform = `translateX(-${currentPage * 100}%)`;
}

/**
 * 점 상태 업데이트
 */
function updateDots() {
  const dots = document.querySelectorAll('.popular-dot');
  const currentPage = window.currentPopularPage || 0;
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });
}

/**
 * 슬라이더 점 생성
 * @param {number} pageCount - 페이지 개수
 * @param {HTMLElement} container - 점을 생성할 컨테이너
 */
function createDots(pageCount, container) {
  container.innerHTML = '';
  
  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'popular-dot';
    dot.onclick = () => goToPopularPage(i);
    container.appendChild(dot);
  }
}

/**
 * 인기상품 슬라이더 초기화
 */
function initPopularSlider() {
  const slider = document.getElementById('popularSlider');
  if (!slider) return;

  const track = slider.querySelector('.popular-track');
  const pages = slider.querySelectorAll('.popular-page');
  const dotsContainer = slider.querySelector('.popular-dots');
  
  if (!track || pages.length === 0) return;

  // 점 생성
  createDots(pages.length, dotsContainer);
  
  // 현재 페이지 인덱스 (전역 변수)
  window.currentPopularPage = 0;
  
  // 초기 상태 설정
  updateSliderPosition();
  updateDots();
}

// ===== 이벤트 리스너 설정 =====

/**
 * 검색 입력 필드 이벤트 설정
 */
function setupSearchEvents() {
  const searchInput = document.getElementById('searchKeyword');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        goSearch();
      }
    });
  }
}

/**
 * 이미지 오류 이벤트 설정
 */
function setupImageErrorEvents() {
  const images = document.querySelectorAll('.product-image');
  images.forEach(img => {
    img.addEventListener('error', function() {
      handleImageError(this);
    });
  });
}

// ===== 페이지 초기화 =====

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  // 최근 본 상품 표시 초기화
  if (typeof updateRecentProductsDisplay === 'function') {
    updateRecentProductsDisplay();
  }
  
  // 검색 입력 필드 이벤트 설정
  setupSearchEvents();
  
  // 이미지 오류 이벤트 설정
  setupImageErrorEvents();

  // 인기상품 슬라이더 초기화
  initPopularSlider();
});
