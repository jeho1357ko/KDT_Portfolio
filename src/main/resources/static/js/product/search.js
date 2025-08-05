// ===== 검색 결과 페이지 JavaScript =====

/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('.product-card') || img.parentElement;
  if (container) {
    // 기존 오류 메시지가 있는지 확인
    let errorMessage = container.querySelector('.image-error-message');
    
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'image-error-message';
      errorMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        z-index: 10;
        text-align: center;
        max-width: 80%;
        word-wrap: break-word;
      `;
      errorMessage.textContent = '이미지를 불러오는데 실패했습니다';
      
      // 이미지 컨테이너에 상대 위치 설정
      const imageContainer = img.parentElement;
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(errorMessage);
        
        // 3초 후 메시지 숨기기
        setTimeout(() => {
          if (errorMessage && errorMessage.parentElement) {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
              if (errorMessage && errorMessage.parentElement) {
                errorMessage.remove();
              }
            }, 500);
          }
        }, 3000);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // 필터 요소들
  const statusFilter = document.getElementById('statusFilter');
  const priceFilter = document.getElementById('priceFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  // 필터 변경 이벤트 리스너
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
  if (priceFilter) {
    priceFilter.addEventListener('change', applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener('change', applyFilters);
  }
  
  // 검색 결과 그리드
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  
  // 이미지 로드 실패 시 처리
  const images = document.querySelectorAll('.product-image');
  images.forEach(img => {
    img.addEventListener('error', function() {
      handleImageError(this);
    });
  });
  
  // 필터 적용 함수
  function applyFilters() {
    const status = statusFilter ? statusFilter.value : '';
    const price = priceFilter ? priceFilter.value : '';
    const sort = sortFilter ? sortFilter.value : '';
    
    // URL 파라미터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword') || '';
    
    // 새로운 URL 생성
    const newParams = new URLSearchParams();
    if (keyword) newParams.append('keyword', keyword);
    if (status) newParams.append('status', status);
    if (price) newParams.append('price', price);
    if (sort) newParams.append('sort', sort);
    
    // 페이지 새로고침으로 필터 적용
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.location.href = newUrl;
  }
  
  // 검색 결과 애니메이션
  function animateSearchResults() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
  
  // 페이지 로드 시 애니메이션 실행
  if (searchResultsGrid) {
    animateSearchResults();
  }
  
  // 검색 입력 필드 포커스 효과
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('focus', function() {
      this.parentElement.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
    });
    
    searchInput.addEventListener('blur', function() {
      this.parentElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    });
  }
  
  // 검색 결과 카운트 애니메이션
  function animateCount() {
    const countElement = document.querySelector('.search-results-count span');
    if (countElement) {
      const finalCount = parseInt(countElement.textContent);
      let currentCount = 0;
      
      const interval = setInterval(() => {
        currentCount += Math.ceil(finalCount / 20);
        if (currentCount >= finalCount) {
          currentCount = finalCount;
          clearInterval(interval);
        }
        countElement.textContent = currentCount;
      }, 50);
    }
  }
  
  // 페이지 로드 시 카운트 애니메이션 실행
  animateCount();
  

  
  // 필터 선택 상태 복원
  function restoreFilterState() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (statusFilter && urlParams.get('status')) {
      statusFilter.value = urlParams.get('status');
    }
    if (priceFilter && urlParams.get('price')) {
      priceFilter.value = urlParams.get('price');
    }
    if (sortFilter && urlParams.get('sort')) {
      sortFilter.value = urlParams.get('sort');
    }
  }
  
  // 페이지 로드 시 필터 상태 복원
  restoreFilterState();
  
  // 검색 결과 없음 메시지 애니메이션
  const noResults = document.querySelector('.no-results');
  if (noResults) {
    noResults.style.opacity = '0';
    noResults.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      noResults.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      noResults.style.opacity = '1';
      noResults.style.transform = 'translateY(0)';
    }, 300);
  }
  
  // 페이지네이션 버튼 이벤트
  const paginationBtns = document.querySelectorAll('.pagination-btn');
  paginationBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 현재 URL 파라미터 가져오기
      const urlParams = new URLSearchParams(window.location.search);
      const currentPage = parseInt(urlParams.get('page') || '1');
      
      // 이전/다음 페이지 계산
      let newPage = currentPage;
      if (this.textContent.includes('이전')) {
        newPage = Math.max(1, currentPage - 1);
      } else if (this.textContent.includes('다음')) {
        newPage = currentPage + 1;
      }
      
      // 새 URL 생성
      urlParams.set('page', newPage.toString());
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.location.href = newUrl;
    });
  });
  
  // 검색어 하이라이트 기능
  function highlightSearchTerm() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    
    if (keyword) {
      const productTitles = document.querySelectorAll('.product-title');
      productTitles.forEach(title => {
        const text = title.textContent;
        const highlightedText = text.replace(
          new RegExp(keyword, 'gi'),
          match => `<mark style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px;">${match}</mark>`
        );
        title.innerHTML = highlightedText;
      });
    }
  }
  
  // 페이지 로드 시 검색어 하이라이트
  highlightSearchTerm();
  
  // 로딩 상태 표시
  function showLoading() {
    const loadingHtml = `
      <div class="loading-container" style="text-align: center; padding: 40px;">
        <div class="loading-spinner" style="
          width: 40px; 
          height: 40px; 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid var(--color-primary); 
          border-radius: 50%; 
          animation: spin 1s linear infinite; 
          margin: 0 auto 16px;">
        </div>
        <p style="color: var(--color-secondary-text);">검색 결과를 불러오는 중...</p>
      </div>
    `;
    
    if (searchResultsGrid) {
      searchResultsGrid.innerHTML = loadingHtml;
    }
  }
  
  // 필터 적용 시 로딩 표시
  function applyFiltersWithLoading() {
    showLoading();
    applyFilters();
  }
  
  // 필터 이벤트 리스너 업데이트
  if (statusFilter) {
    statusFilter.removeEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFiltersWithLoading);
  }
  if (priceFilter) {
    priceFilter.removeEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFiltersWithLoading);
  }
  if (sortFilter) {
    sortFilter.removeEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFiltersWithLoading);
  }
});

// 스핀 애니메이션 CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style); 