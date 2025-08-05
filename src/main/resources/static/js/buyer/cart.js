/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('.cart-item') || img.parentElement;
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
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 11px;
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

// ===== 장바구니 관리자 클래스 =====
class CartManager {
  constructor() {
    this.cartItems = [];
    this.subtotal = 0;
    this.totalDeliveryFee = 0;
    this.total = 0;
    this.buyerId = null;
    
    this.initialize();
  }

  // ===== 초기화 =====
  initialize() {
    console.log('=== 장바구니 페이지 초기화 ===');
    
    this.loadBuyerId();
    this.bindEvents();
    this.loadCartItems();
    
    console.log('장바구니 페이지 초기화 완료');
  }

  // ===== buyerId 로드 =====
  loadBuyerId() {
    const buyerIdElement = document.getElementById('buyerId');
    if (!buyerIdElement || !buyerIdElement.value) {
      console.error('buyerId not found or empty');
      this.showErrorMessage('buyerId가 없습니다. 로그인을 확인하세요.');
      return;
    }
    this.buyerId = buyerIdElement.value;
  }

  // ===== 이벤트 바인딩 =====
  bindEvents() {
    // 전체 선택 체크박스 이벤트
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.handleSelectAll(e.target.checked);
      });
    } else {
      console.error('selectAllCheckbox not found');
    }
  }

  // ===== 장바구니 아이템 로드 =====
  async loadCartItems() {
    try {
      const response = await fetch(`/api/cart/${this.buyerId}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.header && data.header.rtcd === 'S00' && data.body && data.body.length > 0) {
        this.cartItems = data.body;
        await this.checkSoldOutProducts();
        this.renderCartItems();
        this.updateSummary();
      } else {
        this.showEmptyCart();
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      this.showErrorMessage('데이터 로드 중 오류 발생.');
    }
  }

  // ===== 매진 상품 체크 =====
  async checkSoldOutProducts() {
    if (this.cartItems.length === 0) return;
    
    const productIds = this.cartItems.map(item => item.productId);
    
    try {
      const response = await fetch('/api/cart/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productIds)
      });
      
      const data = await response.json();
      
      if (data.header && data.header.rtcd === 'S00') {
        this.soldOutProducts = data.body || [];
      } else {
        console.error('매진 상품 체크 실패:', data);
        this.soldOutProducts = [];
      }
    } catch (error) {
      console.error('매진 상품 체크 중 오류:', error);
      this.soldOutProducts = [];
    }
  }

  // ===== 장바구니 아이템 렌더링 =====
  renderCartItems() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';
    
    this.cartItems.forEach(item => {
      const itemElement = this.createCartItemElement(item);
      cartList.appendChild(itemElement);
    });
  }

  // ===== 장바구니 아이템 요소 생성 =====
  createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.dataset.id = item.productId;
    itemElement.dataset.price = item.productPrice;
    itemElement.dataset.quantity = item.quantity;
    itemElement.dataset.cartId = item.cartId;
    itemElement.dataset.deliveryFee = item.deliveryFee || 3000;
    
    const deliveryFee = item.deliveryFee || 3000;
    const itemTotal = item.productPrice * item.quantity;
    const isSoldOut = this.soldOutProducts.includes(item.productId);
    const isOrdered = item.isChecked === 'Y';
    
    if (isSoldOut) {
      itemElement.classList.add('sold-out');
    }
    
    if (isOrdered) {
      itemElement.classList.add('ordered');
    }
    
    itemElement.innerHTML = `
      <input type="checkbox" 
             class="item-checkbox" 
             ${isSoldOut || isOrdered ? 'disabled' : 'checked'} 
             onchange="cartManager.updateSummary()"
             aria-label="상품 선택">
      <img src="${item.productThumbnail}" 
           alt="${item.productTitle}" 
           class="item-image"
           loading="lazy"
           onerror="handleImageError(this)">
      <div class="item-info">
        <p class="name">
          ${item.productTitle}
          ${isSoldOut ? '<span class="status-badge status-sold-out">매진</span>' : ''}
          ${isOrdered ? '<span class="status-badge status-ordered">주문완료</span>' : ''}
        </p>
        <p class="price">${this.formatNumber(item.productPrice)}원</p>
        <p class="delivery-fee">배송비: ${this.formatNumber(deliveryFee)}원</p>
      </div>
      <div class="quantity-selector">
        <button class="minus-btn" 
                ${isSoldOut || isOrdered ? 'disabled' : ''} 
                onclick="cartManager.changeQuantity(${item.cartId}, 'decrease')"
                aria-label="수량 감소">-</button>
        <input type="text" 
               value="${item.quantity}" 
               readonly 
               class="quantity-input"
               aria-label="수량">
        <button class="plus-btn" 
                ${isSoldOut || isOrdered ? 'disabled' : ''} 
                onclick="cartManager.changeQuantity(${item.cartId}, 'increase')"
                aria-label="수량 증가">+</button>
      </div>
      <div class="item-total-price">${this.formatNumber(itemTotal + deliveryFee)}원</div>
      <button class="item-delete-btn" 
              onclick="cartManager.deleteItem(${item.cartId})"
              aria-label="상품 삭제">×</button>
    `;
    
    return itemElement;
  }

  // ===== 전체 선택 처리 =====
  handleSelectAll(checked) {
    document.querySelectorAll('.item-checkbox:not(:disabled)').forEach(cb => {
      cb.checked = checked;
    });
    this.updateSummary();
  }

  // ===== 수량 변경 =====
  async changeQuantity(cartId, action) {
    const item = this.cartItems.find(i => i.cartId === cartId);
    if (!item) {
      console.error('Item not found for cartId:', cartId);
      return;
    }
    
    const oldQuantity = item.quantity;
    
    if (action === 'increase') {
      item.quantity++;
    } else if (action === 'decrease' && item.quantity > 1) {
      item.quantity--;
    } else {
      return;
    }

    try {
      const response = await fetch('/api/cart/quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cartId, quantity: item.quantity })
      });
      
      const data = await response.json();
      
      if (data.header && data.header.rtcd === 'S00') {
        this.updateItemDisplay(item);
        this.updateSummary();
      } else {
        console.error('Update failed:', data);
        item.quantity = oldQuantity; // 롤백
        this.showErrorMessage('수량 업데이트 실패');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      item.quantity = oldQuantity; // 롤백
      this.showErrorMessage('수량 변경 중 오류 발생');
    }
  }

  // ===== 아이템 표시 업데이트 =====
  updateItemDisplay(item) {
    const itemElement = document.querySelector(`.cart-item[data-id="${item.productId}"]`);
    if (itemElement) {
      itemElement.dataset.quantity = item.quantity;
      itemElement.querySelector('.quantity-input').value = item.quantity;
      const deliveryFee = parseInt(itemElement.dataset.deliveryFee);
      const itemTotal = item.productPrice * item.quantity;
      itemElement.querySelector('.item-total-price').textContent = `${this.formatNumber(itemTotal + deliveryFee)}원`;
    }
  }

  // ===== 아이템 삭제 =====
  async deleteItem(cartId) {
    if (!confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
      return;
    }

    const itemElement = document.querySelector(`.cart-item[data-cartId="${cartId}"]`);
    if (itemElement) {
      itemElement.remove();
    }
    
    this.cartItems = this.cartItems.filter(i => i.cartId !== cartId);
    this.updateSummary();

    try {
      const response = await fetch('/api/cart/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cartId })
      });
      
      const data = await response.json();
      
      if (data.header && data.header.rtcd === 'S00') {
        this.showSuccessMessage('상품이 삭제되었습니다.');
        location.reload();
      } else {
        console.error('Delete failed:', data);
        location.reload(); // 실패 시 새로고침
      }
    } catch (error) {
      console.error('Delete Error:', error);
      location.reload(); // 실패 시 새로고침
    }
  }

  // ===== 요약 업데이트 =====
  updateSummary() {
    this.subtotal = 0;
    this.totalDeliveryFee = 0;
    
    document.querySelectorAll('.item-checkbox:checked').forEach(checkbox => {
      const item = checkbox.closest('.cart-item');
      const price = parseInt(item.dataset.price);
      const quantity = parseInt(item.dataset.quantity);
      const deliveryFee = parseInt(item.dataset.deliveryFee);
      
      this.subtotal += price * quantity;
      this.totalDeliveryFee += deliveryFee;
    });
    
    this.total = this.subtotal + this.totalDeliveryFee;

    this.updateSummaryDisplay();
  }

  // ===== 요약 표시 업데이트 =====
  updateSummaryDisplay() {
    const summaryRows = document.querySelectorAll('.summary-row');
    
    if (summaryRows.length >= 3) {
      summaryRows[0].querySelector('span:nth-child(2)').textContent = `${this.formatNumber(this.subtotal)}원`;
      summaryRows[1].querySelector('span:nth-child(2)').textContent = `${this.formatNumber(this.totalDeliveryFee)}원`;
      summaryRows[2].querySelector('span:nth-child(2)').textContent = `${this.formatNumber(this.total)}원`;
    }
  }

  // ===== 선택 상품 주문 =====
  async orderSelected() {
    const selectedItems = Array.from(document.querySelectorAll('.item-checkbox:checked')).map(cb => {
      const item = cb.closest('.cart-item');
      const deliveryFee = parseInt(item.dataset.deliveryFee);
      const cartItem = this.cartItems.find(ci => ci.cartId === parseInt(item.dataset.cartId));
      
      return { 
        productId: parseInt(item.dataset.id), 
        quantity: parseInt(item.dataset.quantity), 
        totalPrice: parseInt(item.dataset.price) * parseInt(item.dataset.quantity),
        deliveryFee: deliveryFee,
        productTitle: cartItem ? cartItem.productTitle : `상품 ID: ${item.dataset.id}`,
        productThumbnail: cartItem ? cartItem.productThumbnail : '/images/product-placeholder.jpg'
      };
    });
    
    if (selectedItems.length === 0) {
      this.showErrorMessage('주문할 상품을 선택해주세요.');
      return;
    }
    
    await this.processOrder(selectedItems);
  }

  // ===== 전체 상품 주문 =====
  async orderAll() {
    if (this.cartItems.length === 0) {
      this.showErrorMessage('장바구니에 상품이 없습니다.');
      return;
    }
    
    const allItems = this.cartItems.map(item => ({ 
      productId: item.productId, 
      quantity: item.quantity, 
      totalPrice: item.productPrice * item.quantity,
      deliveryFee: item.deliveryFee || 3000,
      productTitle: item.productTitle,
      productThumbnail: item.productThumbnail
    }));
    
    await this.processOrder(allItems);
  }

  // ===== 주문 처리 =====
  async processOrder(items) {
    const orderForm = { 
      items: items, 
      totalPrice: items.reduce((sum, i) => sum + i.totalPrice, 0),
      totalDeliveryFee: items.reduce((sum, i) => sum + i.deliveryFee, 0)
    };
    
    // 세션 스토리지에 주문 정보와 buyerId 저장
    sessionStorage.setItem('orderForm', JSON.stringify(orderForm));
    sessionStorage.setItem('buyerId', this.buyerId.toString());
    
    // payment.html로 이동
    window.location.href = '/buyer/payment';
  }

  // ===== 결제 완료된 상품 삭제 =====
  async deleteCompletedItems() {
    if (!this.buyerId) {
      this.showErrorMessage('로그인 정보가 없습니다.');
      return;
    }

    if (!confirm('결제가 완료된 상품들을 장바구니에서 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('/api/cart/delete-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parseInt(this.buyerId))
      });

      const data = await response.json();
      
      if (data.header && data.header.rtcd === 'S00') {
        this.showSuccessMessage('상품이 삭제되었습니다.');
        location.reload();
      } else {
        this.showErrorMessage('삭제 실패: ' + (data.body || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('결제 완료 상품 삭제 중 오류:', error);
      this.showErrorMessage('삭제 중 오류가 발생했습니다.');
    }
  }

  // ===== 빈 장바구니 표시 =====
  showEmptyCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '<div class="empty-cart"><p>장바구니에 담긴 상품이 없습니다.</p></div>';
  }

  // ===== 성공 메시지 표시 =====
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  // ===== 에러 메시지 표시 =====
  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  // ===== 메시지 표시 =====
  showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    
    const cartContainer = document.querySelector('.cart-container');
    cartContainer.insertBefore(messageDiv, cartContainer.firstChild);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // ===== 숫자 포맷 =====
  formatNumber(num) {
    return num.toLocaleString();
  }

  // ===== 페이지 통계 수집 =====
  trackPageView() {
    console.log('장바구니 페이지 조회');
    // Google Analytics나 다른 분석 도구 연동 가능
  }
}

// ===== 전역 함수들 =====
function goToMyPage() {
  window.location.href = '/buyer/info';
}

function goToOrderHistory() {
  window.location.href = '/buyer/orders';
}

function goToCart() {
  window.location.href = '/buyer/cart';
}

// ===== 초기화 =====
let cartManager;

document.addEventListener('DOMContentLoaded', () => {
  cartManager = new CartManager();
  
  // 페이지 통계 수집
  setTimeout(() => {
    cartManager.trackPageView();
  }, 1000);
}); 