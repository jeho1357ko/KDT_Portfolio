// =========================== 상품 기본 로직 ===========================

// 상품 정보 변수 (HTML에서 전달받은 데이터로 초기화됨)
let productData = null;

// DOM 요소들
let quantityInput, minusBtn, plusBtn, totalPriceEl;

/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';

  const container = img.closest('.product-image-section') || img.parentElement;
  if (container) {
    let errorMessage = container.querySelector('.image-error-message');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'image-error-message';
      errorMessage.style.cssText = `
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8); color: white; padding: 12px 16px; border-radius: 6px;
        font-size: 14px; font-weight: 500; z-index: 10; text-align: center; max-width: 90%; word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;
      errorMessage.textContent = '이미지를 불러오는데 실패했습니다';

      const imageContainer = img.parentElement;
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(errorMessage);
        setTimeout(() => {
          if (errorMessage && errorMessage.parentElement) {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.8s ease';
            setTimeout(() => errorMessage?.parentElement && errorMessage.remove(), 800);
          }
        }, 5000);
      }
    }
  }
}

// 초기화 함수
function initializeElements() {
  quantityInput = document.getElementById('quantity');
  minusBtn = document.querySelector('.minus-btn');
  plusBtn = document.getElementById('plusButton');
  totalPriceEl = document.getElementById('totalPrice');

  if (!quantityInput || !minusBtn || !plusBtn || !totalPriceEl) {
    console.error('필수 DOM 요소를 찾을 수 없습니다.');
    return false;
  }
  return true;
}

// 가격 계산 함수
function calculateTotal() {
  const quantity = parseInt(quantityInput.value) || 1;
  const pricePerUnit = Number(quantityInput.dataset.price) || 0;
  const total = quantity * pricePerUnit;
  totalPriceEl.textContent = total.toLocaleString();
  return { quantity, total };
}

// 이벤트 리스너 설정
function setupEventListeners() {
  minusBtn.addEventListener('click', () => {
    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity > 1) {
      quantityInput.value = --quantity;
      calculateTotal();
    }
  });

  plusBtn.addEventListener('click', () => {
    let quantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = ++quantity;
    calculateTotal();
  });

  quantityInput.addEventListener('input', () => {
    let quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity < 1) quantityInput.value = 1;
    calculateTotal();
  });
}

// 장바구니 추가 함수
async function addToCart() {
  if (!productData) {
    console.error('상품 데이터가 설정되지 않았습니다.');
    return alert('상품 정보를 불러올 수 없습니다.');
  }
  if (productData.status === '재고소진') return alert('매진된 상품입니다.');
  if (productData.status === '비활성화') return alert('비활성화된 상품입니다.');

  const { quantity } = calculateTotal();
  const buyerId = document.getElementById('buyerId')?.value;
  if (!buyerId) return alert('로그인 정보가 없습니다.');

  const data = {
    buyerId: parseInt(buyerId),
    productId: parseInt(productData.productId),
    quantity: quantity
  };

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.header?.rtcd === 'S00') {
      showModal('cartModal');
    } else if (result.header?.rtcd === 'E02') {
      alert(result.body || '이미 장바구니에 있는 상품입니다.');
    } else {
      alert('장바구니 추가 실패: ' + (result.header?.rtmsg || '오류'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('장바구니 추가 중 오류 발생');
  }
}

// 바로구매 함수
function buyNow() {
  if (!productData) {
    console.error('상품 데이터가 설정되지 않았습니다.');
    return alert('상품 정보를 불러올 수 없습니다.');
  }
  if (productData.status === '재고소진') return alert('매진된 상품입니다.');
  if (productData.status === '비활성화') return alert('비활성화된 상품입니다.');

  const { quantity, total } = calculateTotal();
  const buyerId = document.getElementById('buyerId')?.value;
  if (!buyerId) return alert('로그인 정보가 없습니다.');

  const orderForm = {
    totalPrice: total,
    totalDeliveryFee: productData.deliveryFee,
    items: [{
      productId: productData.productId,
      productTitle: productData.title,
      productThumbnail: productData.thumbnail,
      quantity: quantity,
      totalPrice: total
    }]
  };

  sessionStorage.setItem('orderForm', JSON.stringify(orderForm));
  sessionStorage.setItem('buyerId', buyerId);
  window.location.href = '/buyer/payment';
}

// 로그인 리다이렉트 함수
function redirectToLogin() {
  if (!productData) {
    console.error('상품 데이터가 설정되지 않았습니다.');
    return alert('상품 정보를 불러올 수 없습니다.');
  }
  if (productData.status === '재고소진') return alert('매진된 상품입니다.');
  if (productData.status === '비활성화') return alert('비활성화된 상품입니다.');
  showModal('loginModal');
}

// 모달 표시/닫기
function showModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal() { document.getElementById('cartModal').classList.remove('active'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('active'); }

// 장바구니로 이동
function goToCart() {
  const buyerId = document.getElementById('buyerId')?.value;
  if (buyerId) window.location.href = `/buyer/cart/${buyerId}`;
  else alert('로그인 정보가 없습니다.');
}

// 로그인 페이지로 이동
function goToLogin() { window.location.href = '/buyer/login'; }

// Thymeleaf에서 전달받은 상품 데이터 설정
function setProductData(data) { 
  productData = data; 
  console.log('상품 데이터 설정됨:', productData);
}

// 가격 비교 관련 함수들 (생략된 기존 로직 유지)
async function loadPriceComparisonData() {
  console.log('[loadPriceComparisonData] 시작');
  
  if (!productData) {
    console.error('상품 데이터가 설정되지 않았습니다.');
    return;
  }
  
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : null;
  if (!productName) {
    const productNameEl = document.getElementById('productName');
    productName = productNameEl ? productNameEl.textContent.trim() : null;
  }
  if (!productName) {
    console.error('상품명을 찾을 수 없습니다.');
    return;
  }

  console.log('[loadPriceComparisonData] 원본 상품명:', productName);
  
  productName = productName.replace(/[\/\(\)~,，]/g, ' ').replace(/\s+/g, ' ').trim();
  const keywords = productName.split(' ');
  const primaryKeyword = keywords[0] || productName;
  
  console.log('[loadPriceComparisonData] 처리된 상품명:', productName);
  console.log('[loadPriceComparisonData] 주요 키워드:', primaryKeyword);

  try {
    const currentPrice = productData.price;
    const url = `/price/api/detail/${encodeURIComponent(primaryKeyword)}?currentPrice=${currentPrice}`;
    console.log('[loadPriceComparisonData] 요청 URL:', url);
    
    const response = await fetch(url);
    console.log('[loadPriceComparisonData] 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[loadPriceComparisonData] 응답 에러:', errorText);
      throw new Error(`가격 정보를 불러올 수 없습니다. (${response.status})`);
    }
    
    const data = await response.json();
    console.log('[loadPriceComparisonData] 응답 데이터:', data);
    
    if (data.hasData) {
      displayLastMonthPrice(data);
    } else {
      console.log('[loadPriceComparisonData] 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('가격 비교 데이터 로드 중 오류:', error);
  }
}

function displayLastMonthPrice(data) {
  const lastMonthPriceEl = document.getElementById('lastMonthPrice');
  const lastMonthPriceValueEl = document.getElementById('lastMonthPriceValue');
  const priceComparisonEl = document.getElementById('priceComparison');
  const priceChangeRateEl = document.getElementById('priceChangeRate');
  const showSizePricesBtn = document.getElementById('showSizePrices');

  if (lastMonthPriceEl && lastMonthPriceValueEl && priceChangeRateEl) {
    const lastMonthAverage = Math.round(data.lastMonthAverage).toLocaleString();
    lastMonthPriceValueEl.textContent = lastMonthAverage;

    const changeRate = data.priceChangeRate;
    if (changeRate !== null && changeRate !== undefined) {
      const changeText = changeRate > 0 ? `+${changeRate.toFixed(1)}%` : `${changeRate.toFixed(1)}%`;
      priceChangeRateEl.textContent = changeText;
      priceChangeRateEl.className = `price-change-rate ${changeRate > 0 ? 'positive' : changeRate < 0 ? 'negative' : 'neutral'}`;
      priceComparisonEl && (priceComparisonEl.style.display = 'inline-flex');
    } else {
      priceComparisonEl && (priceComparisonEl.style.display = 'none');
    }

    if (showSizePricesBtn) {
      showSizePricesBtn.style.display = 'inline-block';
      showSizePricesBtn.addEventListener('click', loadSizePrices);
    }
    lastMonthPriceEl.style.display = 'flex';
  } else {
    console.error('필요한 DOM 요소를 찾을 수 없습니다.');
  }
}

// 다나와 스타일 팝업 관련 (생략 없이 유지)
async function showSizePricesAtPosition(element) {
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : productData.title;

  const danawaPopup = document.getElementById('danawaPopup');
  const popupContent = document.getElementById('popupContent');
  if (!danawaPopup || !popupContent) return console.error('다나와 팝업을 찾을 수 없습니다.');

  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  danawaPopup.style.position = 'absolute';
  danawaPopup.style.top = (rect.bottom + scrollTop + 5) + 'px';
  danawaPopup.style.left = (rect.left + scrollLeft) + 'px';
  danawaPopup.style.display = 'block';

  popupContent.innerHTML = '<div class="loading">크기별 가격 정보를 불러오는 중...</div>';

  try {
    const response = await fetch(`/price/api/detail/${encodeURIComponent(productName)}/sizes`);
    if (!response.ok) throw new Error('크기별 가격 정보를 불러올 수 없습니다.');
    const data = await response.json();
    if (data.hasData) displaySizePricesInPopup(data);
    else popupContent.innerHTML = '<div class="no-data">해당 상품의 크기별 가격 정보가 없습니다.</div>';
  } catch (error) {
    console.error('크기별 가격 데이터 로드 중 오류:', error);
    popupContent.innerHTML = '<div class="no-data">가격 정보를 불러오는 중 오류가 발생했습니다.</div>';
  }
}

function displaySizePricesInPopup(data) {
  const popupContent = document.getElementById('popupContent');
  if (!popupContent) return;

  let html = '';
  if (data.sizeAverages && Object.keys(data.sizeAverages).length > 0) {
    html += '<h4>등급별 평균 가격</h4>';
    Object.entries(data.sizeAverages).forEach(([grade, price]) => {
      html += `
        <div class="price-item">
          <span class="price-label">${grade}</span>
          <span class="price-value">${Math.round(price).toLocaleString()}원</span>
        </div>`;
    });
  }
  if (data.unitAverages && Object.keys(data.unitAverages).length > 0) {
    html += '<h4>단위별 평균 가격</h4>';
    Object.entries(data.unitAverages).forEach(([unit, price]) => {
      html += `
        <div class="price-item">
          <span class="price-label">${unit}</span>
          <span class="price-value">${Math.round(price).toLocaleString()}원</span>
        </div>`;
    });
  }
  popupContent.innerHTML = html;
}

function closeDanawaPopup() {
  const danawaPopup = document.getElementById('danawaPopup');
  if (danawaPopup) danawaPopup.style.display = 'none';
}

async function loadSizePrices() {
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : productData.title;

  const sizePricesSection = document.getElementById('sizePricesSection');
  const sizePricesContent = document.getElementById('sizePricesContent');
  if (!sizePricesSection || !sizePricesContent) return console.error('크기별 가격 섹션을 찾을 수 없습니다.');

  sizePricesContent.innerHTML = '<div class="loading">크기별 가격 정보를 불러오는 중...</div>';
  sizePricesSection.style.display = 'block';

  try {
    const response = await fetch(`/price/api/detail/${encodeURIComponent(productName)}/sizes`);
    if (!response.ok) throw new Error('크기별 가격 정보를 불러올 수 없습니다.');
    const data = await response.json();
    if (data.hasData) displaySizePrices(data);
    else sizePricesContent.innerHTML = '<div class="no-data">해당 상품의 크기별 가격 정보가 없습니다.</div>';
  } catch (error) {
    console.error('크기별 가격 데이터 로드 중 오류:', error);
    sizePricesContent.innerHTML = '<div class="no-data">가격 정보를 불러오는 중 오류가 발생했습니다.</div>';
  }
}

function displaySizePrices(data) {
  const sizePricesContent = document.getElementById('sizePricesContent');
  if (!sizePricesContent) return;

  let html = '';
  if (data.sizeAverages && Object.keys(data.sizeAverages).length > 0) {
    html += '<h3>등급별 평균 가격</h3>';
    Object.entries(data.sizeAverages).forEach(([grade, price]) => {
      html += `
        <div class="price-card">
          <div class="size-info">
            <div class="size-name">${grade}</div>
            <div class="size-unit">등급</div>
          </div>
          <div class="price-info">
            <div class="price-value">${Math.round(price).toLocaleString()}원</div>
            <div class="price-period">최근 3개월 평균</div>
          </div>
        </div>`;
    });
  }
  if (data.unitAverages && Object.keys(data.unitAverages).length > 0) {
    html += '<h3>단위별 평균 가격</h3>';
    Object.entries(data.unitAverages).forEach(([unit, price]) => {
      html += `
        <div class="price-card">
          <div class="size-info">
            <div class="size-name">${unit}</div>
            <div class="size-unit">단위</div>
          </div>
          <div class="price-info">
            <div class="price-value">${Math.round(price).toLocaleString()}원</div>
            <div class="price-period">최근 3개월 평균</div>
          </div>
        </div>`;
    });
  }
  sizePricesContent.innerHTML = html;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  if (initializeElements()) {
    setupEventListeners();
    calculateTotal();

    const productImage = document.getElementById('productImage');
    if (productImage) productImage.addEventListener('error', function() { handleImageError(this); });

    setTimeout(() => { loadPriceComparisonData(); }, 500);

    document.addEventListener('click', function(e) {
      const danawaPopup = document.getElementById('danawaPopup');
      if (danawaPopup && danawaPopup.style.display === 'block') {
        const isClickInside = danawaPopup.contains(e.target);
        const isSizePricesButton = e.target.closest('#showSizePrices');
        if (!isClickInside && !isSizePricesButton) closeDanawaPopup();
      }
    });
  }
});

// =========================== 리뷰 섹션 ===========================

// 엔드포인트 모음
const ReviewAPI = {
  list: (productId) => `/api/review/All?productId=${encodeURIComponent(productId)}`,
  update: (id) => `/api/review/update/${encodeURIComponent(id)}`,
  delete: (id) => `/api/review/delete/${encodeURIComponent(id)}`
};

// CSRF 헤더 (있으면 사용)
function csrfHeader() {
  const meta = document.querySelector('meta[name="_csrf"]');
  const headerMeta = document.querySelector('meta[name="_csrf_header"]');
  if (meta && headerMeta) return { [headerMeta.content]: meta.content };
  return {};
}

// 공통 fetch 래퍼: ApiResponse {code,data} 또는 {header,body} 대응
async function apiFetch(url, options = {}) {
  console.log('[apiFetch] 요청 URL:', url);
  console.log('[apiFetch] 옵션:', options);
  
  const baseHeaders = { 'Content-Type': 'application/json', ...csrfHeader() };
  console.log('[apiFetch] 헤더:', baseHeaders);
  
  try {
    const res = await fetch(url, { headers: baseHeaders, credentials: 'same-origin', ...options });
    console.log('[apiFetch] 응답 상태:', res.status);
    console.log('[apiFetch] 응답 헤더:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[apiFetch] 응답 에러:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const json = await res.json();
    console.log('[apiFetch] 응답 JSON:', json);

    if (json && typeof json === 'object') {
      if ('code' in json && 'data' in json) {
        console.log('[apiFetch] ApiResponse 형식 감지, data 반환:', json.data);
        return json.data;
      }
      if ('header' in json && 'body' in json) {
        console.log('[apiFetch] header/body 형식 감지, body 반환:', json.body);
        return json.body;
      }
    }
    console.log('[apiFetch] 기본 JSON 반환:', json);
    return json; // 배열 등
  } catch (error) {
    console.error('[apiFetch] 에러:', error);
    throw error;
  }
}

// 유틸
function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch { return iso; }
}
function star(score) {
  if (score == null) return '';
  const s = Math.max(0, Math.min(5, Number(score)));
  return '★'.repeat(Math.round(s)) + '☆'.repeat(5 - Math.round(s));
}
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
function escapeAttr(str) { return escapeHtml(str); }
function truncateText(text, limit = 100) {
  const t = String(text || '');
  return t.length > limit
    ? { short: t.slice(0, limit) + '…', hasMore: true }
    : { short: t, hasMore: false };
}

// 템플릿: 이미지(있을 때만), 1행=별점+닉네임, 2행=제목·등록일 / 본문(100자 접힘)
function renderReviewItem(r, sessionBuyerId) {
  const isOwner = sessionBuyerId && Number(r?.buyerId) === Number(sessionBuyerId);
  const created = formatDate(r?.cdate);
  const scoreStars = star(r?.score);
  const nickname = r?.buyerNickname || '익명';

  let imgHtml = '';
  if (r?.pic) {
    const thumbSrc = `data:image/jpeg;base64,${r.pic}`;
    imgHtml = `<img class="review-thumb" src="${thumbSrc}" alt="리뷰 이미지" loading="lazy" onerror="this.remove()">`;
  } else if (r?.picUrl) {
    imgHtml = `<img class="review-thumb" src="${r.picUrl}" alt="리뷰 이미지" loading="lazy" onerror="this.remove()">`;
  }

  const fullContent = r?.content || '';
  const t = truncateText(fullContent, 100);

  return `
  <div class="review-item" data-id="${r.reviewId}">
    <div class="review-head">
      <div class="review-title-wrap">
        ${imgHtml}
        <div class="review-title-text">
          <div class="meta-line">
            <span class="stars">${scoreStars}</span>
            <span class="nickname">${escapeHtml(nickname)}</span>
          </div>
          <div class="sub-line">
            <span class="title">${escapeHtml(r?.title || '(제목 없음)')}</span>
            <span class="date">${created || ''}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="review-body">
      <div class="review-content"
           data-role="content"
           data-full="${escapeAttr(fullContent)}"
           data-short="${escapeAttr(t.short)}"
           data-expanded="false">${escapeHtml(t.short)}</div>

      ${t.hasMore ? `<button class="review-btn review-more" data-state="collapsed">더보기</button>` : ''}

      ${isOwner ? `
      <div class="review-actions" data-role="actions-view">
        <button class="review-btn review-edit">수정</button>
        <button class="review-btn review-delete">삭제</button>
      </div>

      <form class="review-edit-form" data-role="actions-edit">
        <input type="text" name="title" placeholder="제목" value="${escapeAttr(r?.title || '')}" maxlength="100">
        <textarea name="content" placeholder="내용" rows="5">${escapeHtml(fullContent)}</textarea>
        <input type="number" name="score" min="0" max="5" step="1" value="${Number(r?.score ?? 0)}">
        <div class="review-actions">
          <button type="button" class="review-btn review-save">저장</button>
          <button type="button" class="review-btn review-cancel">취소</button>
        </div>
      </form>
      ` : ``}
    </div>
  </div>`;
}

// 아코디언 & 페이지네이션
const REVIEWS_PER_PAGE = 3;
let allReviews = [];
let currentReviewPage = 1;

async function loadReviews(productId) {
  console.log('[loadReviews] productId =', productId);
  const buyerIdInput = document.getElementById('buyerId');
  const sessionBuyerId = buyerIdInput ? Number(buyerIdInput.value) : null;

  try {
    const url = ReviewAPI.list(productId);
    console.log('[loadReviews] 요청 URL:', url);
    
    const resp = await apiFetch(url, { method: 'GET' });
    console.log('[loadReviews] api resp =', resp);
    allReviews = Array.isArray(resp) ? resp : [];

    const countEl = document.getElementById('reviewCount');
    const emptyEl = document.getElementById('reviewsEmpty');
    countEl.textContent = allReviews.length ? `총 ${allReviews.length}개` : '총 0개';

    if (!allReviews.length) {
      emptyEl.style.display = 'block';
      document.getElementById('reviewsList').innerHTML = '';
      document.getElementById('reviewPagination').innerHTML = '';
      return;
    }
    emptyEl.style.display = 'none';

    renderReviewPage(currentReviewPage, sessionBuyerId);
    renderPagination();
  } catch (err) {
    console.error('리뷰 로드 실패:', err);
    const emptyEl = document.getElementById('reviewsEmpty');
    emptyEl.textContent = '리뷰를 불러오는 중 오류가 발생했습니다.';
    emptyEl.style.display = 'block';
    document.getElementById('reviewsList').innerHTML = '';
    document.getElementById('reviewPagination').innerHTML = '';
  }
}

function renderReviewPage(page, sessionBuyerId) {
  currentReviewPage = page;
  const start = (page - 1) * REVIEWS_PER_PAGE;
  const end = start + REVIEWS_PER_PAGE;
  const listEl = document.getElementById('reviewsList');

  const pageReviews = allReviews.slice(start, end);
  listEl.innerHTML = pageReviews.map(r => renderReviewItem(r, sessionBuyerId)).join('');

  // 펼침 토글
  listEl.querySelectorAll('.review-head').forEach(head => {
    head.addEventListener('click', () => {
      const body = head.closest('.review-item').querySelector('.review-body');
      body.classList.toggle('open');
    });
  });

  // 더보기/접기
  listEl.querySelectorAll('.review-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.review-item');
      const content = item.querySelector('[data-role="content"]');
      const expanded = content.getAttribute('data-expanded') === 'true';

      if (expanded) {
        content.textContent = content.dataset.short || '';
        content.setAttribute('data-expanded', 'false');
        btn.textContent = '더보기';
        btn.setAttribute('data-state', 'collapsed');
      } else {
        content.textContent = content.dataset.full || '';
        content.setAttribute('data-expanded', 'true');
        btn.textContent = '접기';
        btn.setAttribute('data-state', 'expanded');
      }
    });
  });

  // 수정/취소/저장/삭제
  listEl.querySelectorAll('.review-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.review-item');
      toggleEditMode(item, true);
    });
  });
  listEl.querySelectorAll('.review-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.review-item');
      toggleEditMode(item, false);
    });
  });
  listEl.querySelectorAll('.review-save').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.review-item');
      await submitEdit(item);
    });
  });
  listEl.querySelectorAll('.review-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.review-item');
      await deleteReview(item);
    });
  });
}

function renderPagination() {
  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  const paginationEl = document.getElementById('reviewPagination');

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === currentReviewPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-page'));
      const sessionBuyerId = document.getElementById('buyerId') ? Number(document.getElementById('buyerId').value) : null;
      renderReviewPage(page, sessionBuyerId);
      renderPagination();
    });
  });
}

// 수정/삭제 UX
function toggleEditMode(item, editing) {
  const viewActions = item.querySelector('[data-role="actions-view"]');
  const editForm = item.querySelector('[data-role="actions-edit"]');
  const body = item.querySelector('.review-body');
  if (!body.classList.contains('open')) body.classList.add('open');

  if (editForm) {
    if (editing) {
      if (viewActions) viewActions.style.display = 'none';
      editForm.classList.add('open');
    } else {
      if (viewActions) viewActions.style.display = '';
      editForm.classList.remove('open');
    }
  }
}

async function submitEdit(item) {
  const id = item.getAttribute('data-id');
  const form = item.querySelector('.review-edit-form');
  if (!form) return;

  const payload = {
    title: form.title.value?.trim() ?? '',
    content: form.content.value?.trim() ?? '',
    pic: null,
    score: Number(form.score.value ?? 0)
  };

  await apiFetch(ReviewAPI.update(id), {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });

  // 캐시 갱신
  const idx = allReviews.findIndex(r => String(r.reviewId) === String(id));
  if (idx > -1) allReviews[idx] = { ...allReviews[idx], ...payload, udate: new Date().toISOString() };

  // 본문(100자 접힘) 반영 + 더보기 버튼 상태 갱신
  const contentView = item.querySelector('[data-role="content"]');
  if (contentView) {
    const t = truncateText(payload.content, 100);
    const expanded = contentView.getAttribute('data-expanded') === 'true';
    contentView.dataset.full  = payload.content || '';
    contentView.dataset.short = t.short || '';
    contentView.textContent   = expanded ? (payload.content || '') : t.short;

    // 더보기 버튼 생성/업데이트/제거
    let moreBtn = item.querySelector('.review-more');
    if (t.hasMore) {
      if (!moreBtn) {
        moreBtn = document.createElement('button');
        moreBtn.className = 'review-btn review-more';
        moreBtn.textContent = expanded ? '접기' : '더보기';
        contentView.insertAdjacentElement('afterend', moreBtn);
        moreBtn.addEventListener('click', () => {
          const isExp = contentView.getAttribute('data-expanded') === 'true';
          if (isExp) {
            contentView.textContent = contentView.dataset.short || '';
            contentView.setAttribute('data-expanded', 'false');
            moreBtn.textContent = '더보기';
          } else {
            contentView.textContent = contentView.dataset.full || '';
            contentView.setAttribute('data-expanded', 'true');
            moreBtn.textContent = '접기';
          }
        });
      } else {
        moreBtn.textContent = expanded ? '접기' : '더보기';
        moreBtn.style.display = '';
      }
    } else if (moreBtn) {
      moreBtn.remove();
    }
  }

  // 제목/별점 갱신 (새 구조에 맞춤)
  const titleEl = item.querySelector('.sub-line .title');
  if (titleEl) titleEl.textContent = payload.title || '(제목 없음)';

  const starEl = item.querySelector('.meta-line .stars');
  if (starEl) starEl.textContent = star(payload.score);

  toggleEditMode(item, false);
}

async function deleteReview(item) {
  const id = item.getAttribute('data-id');
  if (!confirm('해당 리뷰를 삭제하시겠습니까?')) return;

  await apiFetch(ReviewAPI.delete(id), { method: 'DELETE' });

  // allReviews에서 제거
  const idx = allReviews.findIndex(r => String(r.reviewId) === String(id));
  if (idx > -1) allReviews.splice(idx, 1);

  // 카운트/페이지 갱신
  const countEl = document.getElementById('reviewCount');
  countEl.textContent = allReviews.length ? `총 ${allReviews.length}개` : '총 0개';

  const totalPages = Math.ceil((allReviews.length || 1) / REVIEWS_PER_PAGE);
  if (currentReviewPage > totalPages) currentReviewPage = totalPages;

  const sessionBuyerId = document.getElementById('buyerId') ? Number(document.getElementById('buyerId').value) : null;
  if (allReviews.length === 0) {
    document.getElementById('reviewsList').innerHTML = '';
    document.getElementById('reviewPagination').innerHTML = '';
    const emptyEl = document.getElementById('reviewsEmpty');
    emptyEl.style.display = 'block';
    return;
  }

  renderReviewPage(currentReviewPage, sessionBuyerId);
  renderPagination();
}
