
    // ===== 주문 완료 페이지 관리자 클래스 =====
    class PaymentCompleteManager {
      constructor() {
          this.elements = this.initializeElements();
          this.orderData = null;
          
          this.initialize();
      }

      // ===== 요소 초기화 =====
      initializeElements() {
          return {
              completedOrderList: document.getElementById('completedOrderList'),
              successMessage: document.querySelector('.success-message')
          };
      }

      // ===== 초기화 =====
      async initialize() {
          console.log('=== 주문 완료 페이지 초기화 ===');
          
          try {
              // 주문 데이터 로드
              await this.loadOrderData();
              
              // 주문 상품 렌더링
              this.renderCompletedOrder();
              
              // 성공 메시지 표시
              this.showSuccessMessage();
              
              // 세션 스토리지 정리
              this.cleanupSessionStorage();
              
              console.log('주문 완료 페이지 초기화 완료');
          } catch (error) {
              console.error('주문 완료 페이지 초기화 중 오류:', error);
              this.showErrorMessage('주문 정보를 불러오는 중 오류가 발생했습니다.');
          }
      }

      // ===== 주문 데이터 로드 =====
      async loadOrderData() {
          const orderFormData = sessionStorage.getItem('orderForm');
          console.log('세션 스토리지 orderForm:', orderFormData);
          
          if (!orderFormData) {
              console.error('세션 스토리지에 주문 정보가 없습니다.');
              throw new Error('주문 정보를 찾을 수 없습니다.');
          }
          
          try {
              this.orderData = JSON.parse(orderFormData);
              console.log('파싱된 주문 정보:', this.orderData);
              
              if (!this.orderData.items || this.orderData.items.length === 0) {
                  throw new Error('주문 아이템이 없습니다.');
              }
              
              console.log('주문 아이템들:', this.orderData.items);
          } catch (error) {
              console.error('주문 정보 파싱 오류:', error);
              throw new Error('주문 정보 형식이 올바르지 않습니다.');
          }
      }

      // ===== 완료된 주문 상품 렌더링 =====
      renderCompletedOrder() {
          if (!this.orderData || !this.orderData.items) {
              this.showNoOrderMessage();
              return;
          }
          
          this.elements.completedOrderList.innerHTML = '';
          
          this.orderData.items.forEach((item, index) => {
              const itemElement = this.createOrderItemElement(item, index);
              this.elements.completedOrderList.appendChild(itemElement);
          });
          
          // 총 주문 금액 표시
          this.addTotalAmount();
      }

      // ===== 주문 아이템 요소 생성 =====
      createOrderItemElement(item, index) {
          const itemElement = document.createElement('div');
          itemElement.className = 'order-item';
          itemElement.setAttribute('data-product-id', item.productId);
          
          const itemPrice = this.formatNumber(item.totalPrice);
          const productTitle = item.productTitle || `상품 ID: ${item.productId}`;
          const imageSrc = item.productThumbnail || '/images/product-placeholder.jpg';
          
          itemElement.innerHTML = `
              <img src="${imageSrc}" 
                    alt="${productTitle}" 
                    loading="lazy"
                    onerror="this.src='/images/product-placeholder.jpg'">
              <div class="item-info">
                  <div class="name">${productTitle}</div>
                  <div class="quantity">수량: ${item.quantity}개</div>
              </div>
              <div class="item-price">${itemPrice}원</div>
          `;
          
          // 애니메이션 지연 효과
          itemElement.style.animationDelay = `${0.1 * index}s`;
          
          return itemElement;
      }

      // ===== 총 주문 금액 추가 =====
      addTotalAmount() {
          if (!this.orderData || !this.orderData.items) return;
          
          const totalAmount = this.orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalElement = document.createElement('div');
          totalElement.className = 'order-item';
          totalElement.style.borderTop = '2px solid var(--color-primary)';
          totalElement.style.marginTop = 'var(--spacing-md)';
          totalElement.style.paddingTop = 'var(--spacing-md)';
          totalElement.style.fontWeight = 'bold';
          totalElement.style.fontSize = 'var(--font-size-large)';
          
          totalElement.innerHTML = `
              <div class="item-info">
                  <div class="name">총 주문 금액</div>
              </div>
              <div class="item-price">${this.formatNumber(totalAmount)}원</div>
          `;
          
          this.elements.completedOrderList.appendChild(totalElement);
      }

      // ===== 성공 메시지 표시 =====
      showSuccessMessage() {
          if (this.elements.successMessage) {
              this.elements.successMessage.style.display = 'block';
              
              // 5초 후 메시지 숨김
              setTimeout(() => {
                  this.elements.successMessage.style.opacity = '0.7';
              }, 5000);
          }
      }

      // ===== 에러 메시지 표시 =====
      showErrorMessage(message) {
          const errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          errorElement.innerHTML = `<span>❌ ${message}</span>`;
          
          this.elements.completedOrderList.innerHTML = '';
          this.elements.completedOrderList.appendChild(errorElement);
      }

      // ===== 주문 정보 없음 메시지 =====
      showNoOrderMessage() {
          this.elements.completedOrderList.innerHTML = `
              <div style="text-align: center; color: var(--color-text-light); padding: var(--spacing-xl);">
                  <p>주문 정보를 불러올 수 없습니다.</p>
                  <p>홈으로 이동하여 다시 시도해주세요.</p>
              </div>
          `;
      }

      // ===== 세션 스토리지 정리 =====
      cleanupSessionStorage() {
          try {
              sessionStorage.removeItem('orderForm');
              sessionStorage.removeItem('buyerId');
              console.log('세션 스토리지 정리 완료');
          } catch (error) {
              console.error('세션 스토리지 정리 중 오류:', error);
          }
      }

      // ===== 숫자 포맷 =====
      formatNumber(num) {
          if (typeof num !== 'number') {
              num = parseInt(num) || 0;
          }
          return num.toLocaleString();
      }

      // ===== 페이지 통계 수집 =====
      trackPageView() {
          // Google Analytics나 다른 분석 도구 연동 가능
          console.log('주문 완료 페이지 조회');
          
          if (this.orderData && this.orderData.items) {
              const totalItems = this.orderData.items.length;
              const totalAmount = this.orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
              
              console.log(`주문 완료 통계: ${totalItems}개 상품, 총 ${this.formatNumber(totalAmount)}원`);
          }
      }
  }

  // ===== 전역 함수들 =====
  function goToHome() {
      window.location.href = '/home';
  }

  function goToOrderHistory() {
      window.location.href = '/buyer/orders';
  }

  // ===== 초기화 =====
  document.addEventListener('DOMContentLoaded', () => {
      const paymentCompleteManager = new PaymentCompleteManager();
      
      // 페이지 통계 수집
      setTimeout(() => {
          paymentCompleteManager.trackPageView();
      }, 1000);
  });
