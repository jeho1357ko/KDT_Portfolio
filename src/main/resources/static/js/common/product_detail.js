// 상품 정보 변수
let productData = {
  status: '',
  productId: 0,
  title: '',
  productName: '',
  price: 0,
  thumbnail: '',
  deliveryFee: 0
};

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
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('.product-image-section') || img.parentElement;
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
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10;
        text-align: center;
        max-width: 90%;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;
      errorMessage.textContent = '이미지를 불러오는데 실패했습니다';
      
      // 이미지 컨테이너에 상대 위치 설정
      const imageContainer = img.parentElement;
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(errorMessage);
        
        // 5초 후 메시지 숨기기 (상세 페이지는 더 오래 표시)
        setTimeout(() => {
          if (errorMessage && errorMessage.parentElement) {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
              if (errorMessage && errorMessage.parentElement) {
                errorMessage.remove();
              }
            }, 800);
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
    if (isNaN(quantity) || quantity < 1) {
      quantityInput.value = 1;
    }
    calculateTotal();
  });
}

// 장바구니 추가 함수
async function addToCart() {
  if (productData.status === '재고소진') {
    alert('매진된 상품입니다.');
    return;
  }

  if (productData.status === '비활성화') {
    alert('비활성화된 상품입니다.');
    return;
  }

  const { quantity } = calculateTotal();
  const buyerId = document.getElementById('buyerId')?.value;

  if (!buyerId) {
    alert('로그인 정보가 없습니다.');
    return;
  }

  const data = {
    buyerId: parseInt(buyerId),
    productId: parseInt(productData.productId),
    quantity: quantity
  };

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.header?.rtcd === 'S00') {
      showModal('cartModal');
    } else if (result.header?.rtcd === 'E02') {
      alert(result.body || '이미 장바구니에 있는 상품입니다.');
    } else {
      const msg = result.header?.rtmsg || '장바구니 추가 실패';
      alert('장바구니 추가 실패: ' + msg);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('장바구니 추가 중 오류 발생');
  }
}

// 바로구매 함수
function buyNow() {
  if (productData.status === '재고소진') {
    alert('매진된 상품입니다.');
    return;
  }

  if (productData.status === '비활성화') {
    alert('비활성화된 상품입니다.');
    return;
  }

  const { quantity, total } = calculateTotal();
  const buyerId = document.getElementById('buyerId')?.value;

  if (!buyerId) {
    alert('로그인 정보가 없습니다.');
    return;
  }

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
  if (productData.status === '재고소진') {
    alert('매진된 상품입니다.');
    return;
  }

  if (productData.status === '비활성화') {
    alert('비활성화된 상품입니다.');
    return;
  }
  showModal('loginModal');
}

// 모달 표시 함수
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

// 모달 닫기 함수
function closeModal() {
  document.getElementById('cartModal').classList.remove('active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

// 장바구니로 이동
function goToCart() {
  const buyerId = document.getElementById('buyerId')?.value;
  if (buyerId) {
    window.location.href = `/buyer/cart/${buyerId}`;
  } else {
    alert('로그인 정보가 없습니다.');
  }
}

// 로그인 페이지로 이동
function goToLogin() {
  window.location.href = '/buyer/login';
}

// Thymeleaf에서 전달받은 상품 데이터 설정
function setProductData(data) {
  productData = data;
}

// 가격 비교 관련 함수들
async function loadPriceComparisonData() {
  // 숨겨진 상품명 요소에서 실제 상품명 가져오기
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : null;

  // 숨겨진 상품명이 없으면 제목에서 가져오기
  if (!productName) {
    const productNameEl = document.getElementById('productName');
    productName = productNameEl ? productNameEl.textContent.trim() : null;
  }

  if (!productName) {
    console.error('상품명을 찾을 수 없습니다.');
    return;
  }

  // 상품명 정리 (특수문자 제거, 핵심 키워드만 추출)
  productName = productName.replace(/[\/\(\)~,，]/g, ' ').replace(/\s+/g, ' ').trim();

  // 첫 번째 키워드만 사용 (예: "야채왕 근대 2KG / 4KG(3.8~4kg) 박스, 1개" → "야채왕")
  const keywords = productName.split(' ');
  const primaryKeyword = keywords[0] || productName;

  console.log('원본 상품명:', hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : productName);
  console.log('정리된 상품명:', productName);
  console.log('사용할 키워드:', primaryKeyword);

  try {
    // 저번달 평균 가격 조회 (정리된 키워드 사용)
    const currentPrice = productData.price;
    const response = await fetch(`/price/api/detail/${encodeURIComponent(primaryKeyword)}?currentPrice=${currentPrice}`);
    console.log('API 응답 상태:', response.status);
    console.log('전달한 현재 상품 가격:', currentPrice);

    if (!response.ok) {
      throw new Error(`가격 정보를 불러올 수 없습니다. (${response.status})`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);

    if (data.hasData) {
      displayLastMonthPrice(data);
    } else {
      console.log('가격 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('가격 비교 데이터 로드 중 오류:', error);
  }
}

function displayLastMonthPrice(data) {
  console.log('displayLastMonthPrice 호출됨:', data);

  const lastMonthPriceEl = document.getElementById('lastMonthPrice');
  const lastMonthPriceValueEl = document.getElementById('lastMonthPriceValue');
  const priceComparisonEl = document.getElementById('priceComparison');
  const priceChangeRateEl = document.getElementById('priceChangeRate');
  const showSizePricesBtn = document.getElementById('showSizePrices');

  console.log('DOM 요소들:', {
    lastMonthPriceEl: !!lastMonthPriceEl,
    lastMonthPriceValueEl: !!lastMonthPriceValueEl,
    priceComparisonEl: !!priceComparisonEl,
    priceChangeRateEl: !!priceChangeRateEl,
    showSizePricesBtn: !!showSizePricesBtn
  });

  if (lastMonthPriceEl && lastMonthPriceValueEl && priceChangeRateEl) {
    // 저번달 평균 가격 표시
    const lastMonthAverage = Math.round(data.lastMonthAverage).toLocaleString();
    lastMonthPriceValueEl.textContent = lastMonthAverage;
    console.log('저번달 평균 가격 설정:', lastMonthAverage);

    // 가격 변동률 표시 (가격 옆에 표시)
    const changeRate = data.priceChangeRate;
    console.log('가격 변동률:', changeRate);

    // 변동률이 있을 때 표시 (0도 포함)
    if (changeRate !== null && changeRate !== undefined) {
      const changeText = changeRate > 0 ? `+${changeRate.toFixed(1)}%` : `${changeRate.toFixed(1)}%`;
      priceChangeRateEl.textContent = changeText;
      priceChangeRateEl.className = `price-change-rate ${changeRate > 0 ? 'positive' : changeRate < 0 ? 'negative' : 'neutral'}`;

      console.log('가격 변동률 표시:', changeText, '클래스:', priceChangeRateEl.className);

      // 가격 비교 표시 활성화
      if (priceComparisonEl) {
        priceComparisonEl.style.display = 'inline-flex';
        console.log('가격 비교 요소 표시됨');
      }
    } else {
      // 변동률이 없으면 가격 비교 표시 숨김
      if (priceComparisonEl) {
        priceComparisonEl.style.display = 'none';
        console.log('가격 비교 요소 숨김 (변동률 없음)');
      }
    }

    // 크기별 가격 보기 버튼 표시
    if (showSizePricesBtn) {
      showSizePricesBtn.style.display = 'inline-block';
      showSizePricesBtn.addEventListener('click', loadSizePrices);
      console.log('크기별 가격 버튼 표시됨');
    }

    // 저번달 가격 정보 표시
    lastMonthPriceEl.style.display = 'flex';
    console.log('저번달 가격 정보 표시됨');
  } else {
    console.error('필요한 DOM 요소를 찾을 수 없습니다.');
  }
}

// 다나와 방식 크기별 가격보기
async function showSizePricesAtPosition(element) {
  // 숨겨진 상품명 요소에서 실제 상품명 가져오기
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : productData.title;

  const danawaPopup = document.getElementById('danawaPopup');
  const popupContent = document.getElementById('popupContent');

  if (!danawaPopup || !popupContent) {
    console.error('다나와 팝업을 찾을 수 없습니다.');
    return;
  }

  // 클릭한 요소의 위치 계산
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // 팝업 위치 설정 (클릭한 요소 아래에 표시)
  danawaPopup.style.position = 'absolute';
  danawaPopup.style.top = (rect.bottom + scrollTop + 5) + 'px';
  danawaPopup.style.left = (rect.left + scrollLeft) + 'px';
  danawaPopup.style.display = 'block';

  // 로딩 표시
  popupContent.innerHTML = '<div class="loading">크기별 가격 정보를 불러오는 중...</div>';

  try {
    // 크기별 평균 가격 조회
    const response = await fetch(`/price/api/detail/${encodeURIComponent(productName)}/sizes`);
    if (!response.ok) {
      throw new Error('크기별 가격 정보를 불러올 수 없습니다.');
    }

    const data = await response.json();

    if (data.hasData) {
      displaySizePricesInPopup(data);
    } else {
      popupContent.innerHTML = '<div class="no-data">해당 상품의 크기별 가격 정보가 없습니다.</div>';
    }
  } catch (error) {
    console.error('크기별 가격 데이터 로드 중 오류:', error);
    popupContent.innerHTML = '<div class="no-data">가격 정보를 불러오는 중 오류가 발생했습니다.</div>';
  }
}

// 팝업용 크기별 가격 표시 함수
function displaySizePricesInPopup(data) {
  const popupContent = document.getElementById('popupContent');

  if (!popupContent) return;

  let html = '';

  // 등급별 평균 가격 표시
  if (data.sizeAverages && Object.keys(data.sizeAverages).length > 0) {
    html += '<h4>등급별 평균 가격</h4>';
    Object.entries(data.sizeAverages).forEach(([grade, price]) => {
      html += `
        <div class="price-item">
          <span class="price-label">${grade}</span>
          <span class="price-value">${Math.round(price).toLocaleString()}원</span>
        </div>
      `;
    });
  }

  // 단위별 평균 가격 표시
  if (data.unitAverages && Object.keys(data.unitAverages).length > 0) {
    html += '<h4>단위별 평균 가격</h4>';
    Object.entries(data.unitAverages).forEach(([unit, price]) => {
      html += `
        <div class="price-item">
          <span class="price-label">${unit}</span>
          <span class="price-value">${Math.round(price).toLocaleString()}원</span>
        </div>
      `;
    });
  }

  popupContent.innerHTML = html;
}

// 다나와 팝업 닫기
function closeDanawaPopup() {
  const danawaPopup = document.getElementById('danawaPopup');
  if (danawaPopup) {
    danawaPopup.style.display = 'none';
  }
}

// 기존 함수는 유지 (다른 곳에서 사용할 수 있음)
async function loadSizePrices() {
  // 숨겨진 상품명 요소에서 실제 상품명 가져오기
  const hiddenProductNameEl = document.getElementById('hiddenProductName');
  let productName = hiddenProductNameEl ? hiddenProductNameEl.textContent.trim() : productData.title;

  const sizePricesSection = document.getElementById('sizePricesSection');
  const sizePricesContent = document.getElementById('sizePricesContent');

  if (!sizePricesSection || !sizePricesContent) {
    console.error('크기별 가격 섹션을 찾을 수 없습니다.');
    return;
  }

  // 로딩 표시
  sizePricesContent.innerHTML = '<div class="loading">크기별 가격 정보를 불러오는 중...</div>';
  sizePricesSection.style.display = 'block';

  try {
    // 크기별 평균 가격 조회
    const response = await fetch(`/price/api/detail/${encodeURIComponent(productName)}/sizes`);
    if (!response.ok) {
      throw new Error('크기별 가격 정보를 불러올 수 없습니다.');
    }

    const data = await response.json();

    if (data.hasData) {
      displaySizePrices(data);
    } else {
      sizePricesContent.innerHTML = '<div class="no-data">해당 상품의 크기별 가격 정보가 없습니다.</div>';
    }
  } catch (error) {
    console.error('크기별 가격 데이터 로드 중 오류:', error);
    sizePricesContent.innerHTML = '<div class="no-data">가격 정보를 불러오는 중 오류가 발생했습니다.</div>';
  }
}

function displaySizePrices(data) {
  const sizePricesContent = document.getElementById('sizePricesContent');

  if (!sizePricesContent) return;

  let html = '';

  // 등급별 평균 가격 표시
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
        </div>
      `;
    });
  }

  // 단위별 평균 가격 표시
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
        </div>
      `;
    });
  }

  sizePricesContent.innerHTML = html;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  if (initializeElements()) {
    setupEventListeners();
    calculateTotal();

    // 이미지 로드 실패 시 처리
    const productImage = document.getElementById('productImage');
    if (productImage) {
      productImage.addEventListener('error', function() {
        handleImageError(this);
      });
    }

    // 가격 비교 데이터 로드
    setTimeout(() => {
      loadPriceComparisonData();
    }, 500);

    // 문서 클릭 시 팝업 닫기
    document.addEventListener('click', function(e) {
      const danawaPopup = document.getElementById('danawaPopup');
      if (danawaPopup && danawaPopup.style.display === 'block') {
        const isClickInside = danawaPopup.contains(e.target);
        const isSizePricesButton = e.target.closest('#showSizePrices');

        if (!isClickInside && !isSizePricesButton) {
          closeDanawaPopup();
        }
      }
    });
  }
});
