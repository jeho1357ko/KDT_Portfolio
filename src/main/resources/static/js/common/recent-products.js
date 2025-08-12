// ===== 최근 본 상품 관련 상수 =====
const MAX_RECENT_PRODUCTS = 10;
const RECENT_PRODUCTS_KEY = 'recentProducts';

// ===== 최근 본 상품 관련 함수들 =====

// 최근 본 상품 추가
function addToRecentProducts(productId, title, thumbnail, price) {
  let recentProducts = JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY) || '[]');
  
  // 이미 존재하는 상품이면 제거
  recentProducts = recentProducts.filter(product => product.id !== productId);
  
  // 새 상품을 맨 앞에 추가
  recentProducts.unshift({
    id: productId,
    title: title,
    thumbnail: thumbnail,
    price: price,
    timestamp: Date.now()
  });
  
  // 최대 10개까지만 유지
  if (recentProducts.length > MAX_RECENT_PRODUCTS) {
    recentProducts = recentProducts.slice(0, MAX_RECENT_PRODUCTS);
  }
  
  localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(recentProducts));
  
  // 홈페이지에서만 표시 업데이트 (사이드바가 있는 경우)
  if (typeof updateRecentProductsDisplay === 'function') {
    updateRecentProductsDisplay();
  }
}

// 최근 본 상품 표시 업데이트 (홈페이지 전용)
function updateRecentProductsDisplay() {
  const recentProducts = JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY) || '[]');
  const container = document.getElementById('recentProductsList');
  
  if (!container) return; // 사이드바가 없는 페이지에서는 실행하지 않음
  
  if (recentProducts.length === 0) {
    container.innerHTML = `
      <div class="no-recent-products">
        <i class="fas fa-eye-slash"></i>
        <p>최근 본 상품이 없습니다</p>
      </div>
    `;
    return;
  }
  
  const productsHTML = recentProducts.map(product => `
    <div class="recent-product-item" onclick="window.location.href='/seller/product/${product.id}'">
      <div class="recent-product-image">
        <img src="${product.thumbnail}" alt="${product.title}" 
             onerror="handleSidebarImageError(this)">
        <button class="remove-recent-btn" onclick="removeRecentProduct(${product.id}); event.stopPropagation();" title="삭제">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="recent-product-info">
        <h4 class="recent-product-title">${product.title}</h4>
        <p class="recent-product-price">${product.price.toLocaleString()}원</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = productsHTML;
}

// 개별 최근 본 상품 삭제
function removeRecentProduct(productId) {
  let recentProducts = JSON.parse(localStorage.getItem(RECENT_PRODUCTS_KEY) || '[]');
  recentProducts = recentProducts.filter(product => product.id !== productId);
  localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(recentProducts));
  
  // 홈페이지에서만 표시 업데이트 (사이드바가 있는 경우)
  if (typeof updateRecentProductsDisplay === 'function') {
    updateRecentProductsDisplay();
  }
}

// 모든 최근 본 상품 삭제
function clearRecentProducts() {
  if (confirm('최근 본 상품을 모두 삭제하시겠습니까?')) {
    localStorage.removeItem(RECENT_PRODUCTS_KEY);
    
    // 홈페이지에서만 표시 업데이트 (사이드바가 있는 경우)
    if (typeof updateRecentProductsDisplay === 'function') {
      updateRecentProductsDisplay();
    }
  }
}

// ===== 이미지 오류 처리 함수 =====

// 이미지 로드 실패 처리 (사이드바용)
function handleSidebarImageError(img) {
  // 기본 이미지로 대체
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '이미지 불러오는데 실패했습니다';
}
