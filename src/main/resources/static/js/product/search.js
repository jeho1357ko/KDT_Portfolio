// ===== 검색 결과 페이지 JavaScript =====

/**
 * URL에서 쿼리 파라미터 읽기
 * @param {string} param - 파라미터 이름
 * @returns {string|null} 파라미터 값
 */
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}


document.getElementById("syncForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const logBox = document.getElementById("syncLog");
  const logPre = logBox.querySelector("pre");
  const button = document.getElementById("syncButton");

  logBox.style.display = "block";
  logPre.textContent = "🔄 동기화 시작...\n";
  button.disabled = true;

  fetch("/test/copy/db", { method: "POST" })
    .then(res => res.text())
    .then(text => {
      logPre.textContent += text + "\n";
    })
    .catch(err => {
      logPre.textContent += "❌ 오류 발생: " + err + "\n";
    })
    .finally(() => {
      button.disabled = false;
      logPre.textContent += "✅ 작업 완료";
    });
});

/**
 * 검색 결과 표시
 * @param {Array} products - 상품 목록
 */
function displayResults(products) {
  const grid = document.getElementById('searchResultsGrid');
  
  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="text-align: center; padding: 40px;">
        <i class="fas fa-search"></i>
        <h3>검색 결과가 없습니다</h3>
        <p>다른 검색어를 입력해보세요.</p>
        <a href="/home" class="btn-filled">홈으로 돌아가기</a>
      </div>
    `;
  } else {
    let html = '';
    products.forEach(item => {
      const price = item.price ? item.price.toLocaleString() : 'N/A';
      const status = item.status || 'N/A';
      const title = item.title || item.productName || 'N/A';
      const thumbnail = item.thumbnail || '/images/default-product.jpg';
      
      html += `
        <a href="/seller/product/${item.productId}" class="product-card" title="${title}">
          <img src="${thumbnail}" alt="${title}" class="product-image" onerror="handleImageError(this)">
          
          ${status === '재고소진' ? `
            <div class="sold-out-overlay">
              <span class="sold-out-text">매진</span>
            </div>
          ` : ''}
          
          <div class="product-info">
            <p class="product-title">${title}</p>
            <p class="product-price">${price}원</p>
            <p class="product-status">${status}</p>
          </div>
        </a>
      `;
    });
    grid.innerHTML = html;
  }
}

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

/**
 * API 호출을 통한 검색 결과 가져오기
 * @param {Object} searchParams - 검색 파라미터
 * @returns {Promise<Object>} 검색 결과
 */
async function fetchSearchResults(searchParams) {
  try {
    const queryParams = new URLSearchParams();
    
    // 필수 파라미터
    if (searchParams.keyword) {
      queryParams.append('keyword', searchParams.keyword);
    }
    
    // 선택적 파라미터들
    if (searchParams.status) {
      queryParams.append('status', searchParams.status);
    }
    if (searchParams.minPrice) {
      queryParams.append('minPrice', searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      queryParams.append('maxPrice', searchParams.maxPrice);
    }
    if (searchParams.from) {
      queryParams.append('from', searchParams.from);
    }
    if (searchParams.size) {
      queryParams.append('size', searchParams.size);
    }
    if (searchParams.sortScore) {
      queryParams.append('sortScore', searchParams.sortScore);
    }
    if (searchParams.sortDate) {
      queryParams.append('sortDate', searchParams.sortDate);
    }
    
    const response = await fetch(`/api/products/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('검색 API 호출 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 검색 결과를 화면에 렌더링
 * @param {Array} products - 상품 목록
 * @param {string} keyword - 검색 키워드
 */
function renderSearchResults(products, keyword = '') {
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  
  if (!products || products.length === 0) {
    searchResultsGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>검색 결과가 없습니다</h3>
        <p>다른 검색어를 입력해보세요.</p>
        <a href="/home" class="btn-filled">홈으로 돌아가기</a>
      </div>
    `;
    return;
  }
  
  const productsHTML = products.map(product => {
    const priceFormatted = new Intl.NumberFormat('ko-KR').format(product.price);
    const soldOutOverlay = product.status === '재고소진' ? 
      '<div class="sold-out-overlay"><span class="sold-out-text">매진</span></div>' : '';
    
    return `
      <a href="/seller/product/${product.productId}" 
         class="product-card" 
         title="${product.title}">
        <img src="${product.thumbnail || '/images/default-product.jpg'}" 
             alt="${product.title}"
             class="product-image"
             onerror="handleImageError(this)">
        
        ${soldOutOverlay}
        
        <div class="product-info">
          <p class="product-title">${product.title}</p>
          <p class="product-price">${priceFormatted}원</p>
          <p class="product-status">${product.status}</p>
        </div>
      </a>
    `;
  }).join('');
  
  searchResultsGrid.innerHTML = productsHTML;
  
  // 이미지 에러 이벤트 리스너 다시 등록
  const images = searchResultsGrid.querySelectorAll('.product-image');
  images.forEach(img => {
    img.addEventListener('error', function() {
      handleImageError(this);
    });
  });
  
  // 검색어 하이라이트
  if (keyword) {
    highlightSearchTerm(keyword);
  }
  
  // 애니메이션 실행
  animateSearchResults();
}

/**
 * 검색어 하이라이트 기능
 * @param {string} keyword - 검색 키워드
 */
function highlightSearchTerm(keyword) {
  if (!keyword) return;
  
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

/**
 * 검색 결과 카운트 업데이트
 * @param {number} count - 검색 결과 개수
 */
function updateSearchCount(count) {
  const countElement = document.getElementById('searchResultsCount');
  if (countElement) {
    countElement.textContent = count;
    animateCount();
  }
}

/**
 * 검색 결과 개수 애니메이션
 */
function animateCount() {
  const countElement = document.getElementById('searchResultsCount');
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

/**
 * 검색 파라미터 파싱
 * @returns {Object} 검색 파라미터 객체
 */
function parseSearchParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get('keyword') || '';
  const status = urlParams.get('status') || '';
  const price = urlParams.get('price') || '';
  const sort = urlParams.get('sort') || '';
  const page = parseInt(urlParams.get('page') || '1');
  const size = 12; // 페이지당 상품 개수
  
  // 가격 범위 파싱
  let minPrice = null;
  let maxPrice = null;
  if (price) {
    const [min, max] = price.split('-');
    minPrice = min ? parseInt(min) : null;
    maxPrice = max ? parseInt(max) : null;
  }
  
  // 정렬 파라미터 파싱
  let sortScore = null;
  let sortDate = null;
  if (sort) {
    if (sort.includes('price')) {
      sortScore = sort.includes('desc') ? 'desc' : 'asc';
    } else if (sort.includes('date')) {
      sortDate = sort.includes('desc') ? 'desc' : 'asc';
    }
  }
  
  return {
    keyword,
    status,
    minPrice,
    maxPrice,
    sortScore,
    sortDate,
    from: (page - 1) * size,
    size
  };
}

/**
 * 검색 실행
 */
async function performSearch() {
  try {
    showLoading();
    
    const searchParams = parseSearchParams();
    const response = await fetchSearchResults(searchParams);
    
    if (response.header.rtcd === 'S00' || Array.isArray(response)) {
      renderSearchResults(response.body, searchParams.keyword);
      updateSearchCount(response.body.length);
      updateSearchTitle(searchParams.keyword);
    } else {
      throw new Error(response.header.rtmsg || '검색 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('검색 실패:', error);
    showErrorMessage('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

/**
 * 검색 결과 제목 업데이트
 * @param {string} keyword - 검색 키워드
 */
function updateSearchTitle(keyword) {
  const titleElement = document.getElementById('searchResultsTitle');
  if (titleElement) {
    if (keyword) {
      titleElement.innerHTML = `"<span>${keyword}</span>" 검색 결과`;
    } else {
      titleElement.innerHTML = '전체 상품';
    }
  }
}

/**
 * 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showErrorMessage(message) {
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  searchResultsGrid.innerHTML = `
    <div class="error-message" style="text-align: center; padding: 40px; color: #dc3545;">
      <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
      <h3>오류가 발생했습니다</h3>
      <p>${message}</p>
      <button onclick="performSearch()" class="btn-filled" style="margin-top: 16px;">
        다시 시도
      </button>
    </div>
  `;
}

/**
 * 로딩 상태 표시
 */
function showLoading() {
  const loadingHtml = `
    <div class="loading-container" style="text-align: center; padding: 40px;">
      <div class="loading-spinner" style="
        width: 40px; 
        height: 40px; 
        border: 4px solid #f3f3f3; 
        border-top: 4px solid #4CAF50; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
        margin: 0 auto 16px;">
      </div>
      <p style="color: #666;">검색 결과를 불러오는 중...</p>
    </div>
  `;
  
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  if (searchResultsGrid) {
    searchResultsGrid.innerHTML = loadingHtml;
  }
}

/**
 * Elasticsearch 검색 (향후 구현용)
 * @param {string} keyword - 검색 키워드
 */
function searchElasticsearch(keyword) {
  fetch(`/elasticsearch/search?query=${encodeURIComponent(keyword)}`)
    .then(response => response.json())
    .then(data => {
      console.log('Elasticsearch 검색 결과:', data);
      // TODO: Elasticsearch 검색 결과 렌더링 구현
    })
    .catch(error => {
      console.error('Elasticsearch 검색 오류:', error);
    });
}

/**
 * 검색 결과 애니메이션
 */
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

/**
 * 페이지 로드 시 초기화
 */
function initializeSearchPage() {
  const keyword = getQueryParam('keyword') || '';
  const searchKeyword = document.getElementById('searchKeyword');
  if (searchKeyword) {
    searchKeyword.value = keyword;
  }

  if (keyword) {
    console.log('페이지 로드 시 검색어:', keyword);
    performSearch();
  }
}

/**
 * Enter 키로 검색 실행
 */
function setupEnterKeySearch() {
  const searchKeyword = document.getElementById('searchKeyword');
  if (searchKeyword) {
    searchKeyword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 필터 요소들
  const statusFilter = document.getElementById('statusFilter');
  const priceFilter = document.getElementById('priceFilter');
  const sortFilter = document.getElementById('sortFilter');
  const searchForm = document.getElementById('searchForm');
  const searchKeyword = document.getElementById('searchKeyword');
  
  // 검색 결과 그리드
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  
  // 이미지 로드 실패 시 처리
  const images = document.querySelectorAll('.product-image');
  images.forEach(img => {
    img.addEventListener('error', function() {
      handleImageError(this);
    });
  });
  
  // 검색 폼 제출 처리
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const keyword = searchKeyword.value.trim();
      if (!keyword) {
        alert('검색어를 입력해주세요.');
        searchKeyword.focus();
        return;
      }
      
      // URL 업데이트
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('keyword', keyword);
      urlParams.delete('page'); // 페이지 초기화
      
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.pushState({}, '', newUrl);
      
      // 검색 실행
      performSearch();
    });
  }
  
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
    
    // URL 업데이트
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // 검색 실행
    performSearch();
  }
  
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
  

  
  // 검색 입력 필드 포커스 효과
  if (searchKeyword) {
    searchKeyword.addEventListener('focus', function() {
      this.parentElement.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15)';
    });
    
    searchKeyword.addEventListener('blur', function() {
      this.parentElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    });
  }
  
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
      window.history.pushState({}, '', newUrl);
      
      // 검색 실행
      performSearch();
    });
  });
  
  // 페이지 로드 시 API 검색 실행
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('keyword') || urlParams.get('status') || urlParams.get('price') || urlParams.get('sort')) {
    performSearch();
  }
  
  // 초기화 함수들 실행
  initializeSearchPage();
  setupEnterKeySearch();
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