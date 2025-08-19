
  

/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('.product-item, .order-main') || img.parentElement;
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

    // ===== 주문 내역 관리자 클래스 =====
    class OrderHistoryManager {
      constructor() {
        this.elements = this.initializeElements();
        this.orderCache = new Map(); // 주문 상품 정보 캐시
        this.productCache = new Map(); // 상품 정보 캐시
        
        this.initialize();
      }

      // ===== 요소 초기화 =====
      initializeElements() {
        return {
          orderList: document.getElementById('orderList')
        };
      }

      // ===== 초기화 =====
      async initialize() {
        console.log('=== 주문 내역 페이지 초기화 ===');
        
        try {
          // 로딩 상태 표시
          this.showLoadingState();
          
          // 주문 내역 로드
          await this.loadOrderHistory();
          
          console.log('주문 내역 페이지 초기화 완료');
        } catch (error) {
          console.error('주문 내역 페이지 초기화 중 오류:', error);
          this.showErrorMessage('주문 내역을 불러오는 중 오류가 발생했습니다.');
        }
      }

      // ===== 주문 내역 로드 =====
      async loadOrderHistory() {
        try {
          const response = await fetch('/api/order/list');
          const data = await response.json();
          
          console.log('주문 내역 응답:', data);
          
          if (data.header && data.header.rtcd === 'S00' && data.body && data.body.list) {
            await this.renderOrderHistory(data.body.list);
          } else {
            this.showEmptyMessage();
          }
        } catch (error) {
          console.error('주문 내역 로드 오류:', error);
          throw new Error('주문 내역을 불러올 수 없습니다.');
        }
      }

      // ===== 주문 내역 렌더링 =====
      async renderOrderHistory(orders) {
        if (!orders || orders.length === 0) {
          this.showEmptyMessage();
          return;
        }

        this.elements.orderList.innerHTML = '';

        // 주문들을 병렬로 처리
        const orderPromises = orders.map(order => this.renderOrderItem(order));
        await Promise.all(orderPromises);
      }

      // ===== 개별 주문 아이템 렌더링 =====
      async renderOrderItem(order) {
        const orderElement = document.createElement('article');
        orderElement.className = 'order-item';
        orderElement.setAttribute('data-order-id', order.orderId);
        
        // 주문 상태 설정
        const { statusClass, statusText } = this.getOrderStatus(order.orderStatus);
        
        try {
          // 주문 상품 정보 로드
          const items = await this.loadOrderItems(order.orderId);
          
          if (items && items.length > 0) {
            // 첫 번째 상품 정보로 메인 표시
            const firstItem = items[0];
            const productInfo = await this.getProductInfo(firstItem.productId);
            
            this.renderOrderMain(orderElement, order, statusClass, statusText, productInfo, items.length);
            this.renderProductList(orderElement, items);
            this.addClickEvent(orderElement);
            
          } else {
            this.renderFallbackOrder(orderElement, order, statusClass, statusText, 0);
          }
          
          this.elements.orderList.appendChild(orderElement);
          
        } catch (error) {
          console.error(`주문 ${order.orderId} 렌더링 오류:`, error);
          this.renderFallbackOrder(orderElement, order, statusClass, statusText, 0);
          this.elements.orderList.appendChild(orderElement);
        }
      }

      // ===== 주문 상태 정보 가져오기 =====
      getOrderStatus(orderStatus) {
        let statusClass = 'status-cancelled';
        let statusText = '주문 취소';
        
        switch (orderStatus) {
          case '결제완료':
            statusClass = 'status-completed';
            statusText = '결제 완료';
            break;
          case '배송중':
            statusClass = 'status-shipping';
            statusText = '배송중';
            break;
          case '배송완료':
            statusClass = 'status-completed';
            statusText = '배송 완료';
            break;
          case '주문대기':
            statusClass = 'status-pending';
            statusText = '주문 대기';
            break;
          default:
            statusClass = 'status-cancelled';
            statusText = '주문 취소';
        }
        
        return { statusClass, statusText };
      }

      // ===== 주문 상품 정보 로드 =====
      async loadOrderItems(orderId) {
        // 캐시 확인
        if (this.orderCache.has(orderId)) {
          return this.orderCache.get(orderId);
        }
        
        try {
          const response = await fetch(`/api/order/detail?orderId=${orderId}`);
          const data = await response.json();
          
          if (data.header && data.header.rtcd === 'S00' && data.body && data.body.items) {
            this.orderCache.set(orderId, data.body.items);
            return data.body.items;
          }
          return [];
        } catch (error) {
          console.error(`주문 ${orderId} 상품 정보 로드 오류:`, error);
          return [];
        }
      }

      // ===== 상품 정보 가져오기 =====
      async getProductInfo(productId) {
        // 캐시 확인
        if (this.productCache.has(productId)) {
          return this.productCache.get(productId);
        }
        
        try {
          const response = await fetch(`/seller/api/product/${productId}`);
          const data = await response.json();
          
          let productInfo = {
            thumbnail: '/images/product-placeholder.jpg',
            title: `상품 ID: ${productId}`
          };
          
          if (data.header && data.header.rtcd === 'S00' && data.body) {
            productInfo = {
              thumbnail: data.body.thumbnail || '/images/product-placeholder.jpg',
              title: data.body.title || `상품 ID: ${productId}`
            };
          }
          
          this.productCache.set(productId, productInfo);
          return productInfo;
        } catch (error) {
          console.error(`상품 ${productId} 정보 로드 오류:`, error);
          return {
            thumbnail: '/images/product-placeholder.jpg',
            title: `상품 ID: ${productId}`
          };
        }
      }

      // ===== 주문 메인 정보 렌더링 =====
      renderOrderMain(orderElement, order, statusClass, statusText, productInfo, itemCount) {
        const mainSection = document.createElement('div');
        mainSection.className = 'order-main';
        
        mainSection.innerHTML = `
          <img class="product-image" 
               src="${productInfo.thumbnail}" 
               alt="${productInfo.title}"
               loading="lazy"
               onerror="this.src='/images/product-placeholder.jpg'">
          <div class="order-details">
            <div class="order-number">주문번호: ${order.orderNumber || order.orderId}</div>
            <div class="product-name">${productInfo.title}</div>
            <div class="seller-name">수령자: ${order.name}</div>
            <div class="price-quantity">주문일: ${this.formatDate(order.orderDate)} | ${itemCount}개 상품</div>
            <div class="order-info">주소: ${order.deliveryAddress}</div>
          </div>
          <div class="order-status ${statusClass}" aria-label="주문 상태: ${statusText}">${statusText}</div>
          <div class="expand-icon" aria-label="상품 목록 펼치기">▼</div>
        `;
        
        orderElement.appendChild(mainSection);
      }

      // ===== 상품 목록 렌더링 =====
      async renderProductList(orderElement, items) {
        const productsContainer = document.createElement('div');
        productsContainer.className = 'order-products';
        productsContainer.setAttribute('data-order-id', orderElement.getAttribute('data-order-id'));
        
        // 상품들을 병렬로 처리
        const productPromises = items.map(item => this.renderProductItem(item));
        const productElements = await Promise.all(productPromises);
        
        productElements.forEach(element => {
          productsContainer.appendChild(element);
        });
        
        orderElement.appendChild(productsContainer);
      }

      // ===== 개별 상품 아이템 렌더링 =====
      async renderProductItem(item) {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.setAttribute('data-product-id', item.productId);
        
        try {
          const productInfo = await this.getProductInfo(item.productId);
          
          // 리뷰 작성 가능 여부 확인
          const canWriteReview = await this.canWriteReview(item.productId, item.orderId, item.orderItemId);
          const hasReview = await this.hasReview(item.productId);
          
          let reviewButton = '';
          if (canWriteReview && !hasReview) {
            reviewButton = `<button class="review-btn" onclick="openReviewModal(${item.productId}, ${item.orderId}, ${item.orderItemId}, '${productInfo.title}', '${productInfo.thumbnail}', ${item.quantity}, ${item.unitPrice})">리뷰 작성</button>`;
          } else if (hasReview) {
            reviewButton = `<button class="review-btn review-written" disabled>리뷰 작성 완료</button>`;
          }
          
          productElement.innerHTML = `
            <img class="product-item-image" 
                 src="${productInfo.thumbnail}" 
                 alt="${productInfo.title}"
                 loading="lazy"
                 onerror="handleImageError(this)">
            <div class="product-item-details">
              <div class="product-item-name">${productInfo.title}</div>
              <div class="product-item-info">수량: ${item.quantity}개 | 가격: ${this.formatNumber(item.unitPrice)}원</div>
              ${reviewButton}
            </div>
          `;
          
          // 상품 클릭 이벤트 (리뷰 버튼 클릭 시에는 상품 페이지로 이동하지 않음)
          productElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('review-btn')) {
              e.stopPropagation();
              window.location.href = `/seller/product/${item.productId}`;
            }
          });
          
        } catch (error) {
          console.error(`상품 ${item.productId} 렌더링 오류:`, error);
          productElement.innerHTML = `
            <img class="product-item-image" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=" alt="상품 이미지">
            <div class="product-item-details">
              <div class="product-item-name">상품 ID: ${item.productId}</div>
              <div class="product-item-info">수량: ${item.quantity}개 | 가격: ${this.formatNumber(item.unitPrice)}원</div>
            </div>
          `;
        }
        
        return productElement;
      }

      // ===== 리뷰 작성 가능 여부 확인 =====
      async canWriteReview(productId, orderId, orderItemId) {
        // 주문 상태와 관계없이 리뷰 작성 가능
        return true;
      }

      // ===== 이미 리뷰를 작성했는지 확인 =====
      async hasReview(productId) {
        try {
          const response = await fetch(`/api/review/All?productId=${productId}`);
          const data = await response.json();
          
          if (data.header && data.header.rtcd === 'S00' && data.body) {
            // 현재 로그인한 사용자가 작성한 리뷰가 있는지 확인
            const reviews = data.body;
            return reviews.length > 0;
          }
          return false;
        } catch (error) {
          console.error('리뷰 존재 여부 확인 오류:', error);
          return false;
        }
      }

      // ===== 폴백 주문 렌더링 =====
      renderFallbackOrder(orderElement, order, statusClass, statusText, itemCount) {
        orderElement.innerHTML = `
          <div class="order-main">
            <img class="product-image" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=" alt="상품 이미지">
            <div class="order-details">
              <div class="order-number">주문번호: ${order.orderNumber || order.orderId}</div>
              <div class="product-name">주문 정보 없음</div>
              <div class="seller-name">수령자: ${order.name}</div>
              <div class="price-quantity">주문일: ${this.formatDate(order.orderDate)}${itemCount > 0 ? ` | ${itemCount}개 상품` : ''}</div>
              <div class="order-info">주소: ${order.deliveryAddress}</div>
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
            <div class="expand-icon">▼</div>
          </div>
          <div class="order-products" data-order-id="${order.orderId}">
            <!-- 상품 목록이 여기에 동적으로 추가됩니다 -->
          </div>
        `;
      }

      // ===== 클릭 이벤트 추가 =====
      addClickEvent(orderElement) {
        orderElement.addEventListener('click', function() {
          const productsContainer = this.querySelector('.order-products');
          const expandIcon = this.querySelector('.expand-icon');
          
          if (productsContainer && expandIcon) {
            productsContainer.classList.toggle('expanded');
            expandIcon.classList.toggle('expanded');
            
            // 접근성 개선
            const isExpanded = productsContainer.classList.contains('expanded');
            expandIcon.setAttribute('aria-label', isExpanded ? '상품 목록 접기' : '상품 목록 펼치기');
          }
        });
      }

      // ===== 로딩 상태 표시 =====
      showLoadingState() {
        this.elements.orderList.innerHTML = `
          <div class="loading-message">
            <p>주문 내역을 불러오는 중...</p>
          </div>
        `;
      }

      // ===== 빈 상태 메시지 =====
      showEmptyMessage() {
        this.elements.orderList.innerHTML = `
          <div class="empty-message">
            <p>주문 내역이 없습니다.</p>
            <p>첫 번째 주문을 시작해보세요!</p>
          </div>
        `;
      }

      // ===== 에러 메시지 =====
      showErrorMessage(message) {
        this.elements.orderList.innerHTML = `
          <div class="error-message">
            <p>❌ ${message}</p>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        `;
      }

      // ===== 날짜 포맷 =====
      formatDate(dateString) {
        if (!dateString) return '날짜 정보 없음';
        
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          return dateString;
        }
      }

      // ===== 숫자 포맷 =====
      formatNumber(num) {
        if (typeof num !== 'number') {
          num = parseInt(num) || 0;
        }
        return num.toLocaleString();
      }

      // ===== 캐시 정리 =====
      clearCache() {
        this.orderCache.clear();
        this.productCache.clear();
      }

      // ===== 페이지 통계 수집 =====
      trackPageView() {
        console.log('주문 내역 페이지 조회');
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

    // ===== 리뷰 모달 관련 전역 함수들 =====
    let currentReviewData = null;

    function openReviewModal(productId, orderId, orderItemId, productTitle, productImage, quantity, unitPrice) {
      currentReviewData = {
        productId,
        orderId,
        orderItemId,
        productTitle,
        productImage,
        quantity,
        unitPrice
      };

      // 모달 내용 설정
      document.getElementById('reviewProductImage').src = productImage;
      document.getElementById('reviewProductTitle').textContent = productTitle;
      document.getElementById('reviewProductInfo').textContent = `수량: ${quantity}개 | 가격: ${Number(unitPrice).toLocaleString()}원`;
      
      document.getElementById('reviewProductId').value = productId;
      document.getElementById('reviewOrderId').value = orderId;
      document.getElementById('reviewOrderItemId').value = orderItemId;
      
      // 폼 초기화
      document.getElementById('reviewForm').reset();
      document.getElementById('imagePreview').style.display = 'none';
      
      // 모달 표시
      document.getElementById('reviewModal').style.display = 'flex';
    }

    function closeReviewModal() {
      document.getElementById('reviewModal').style.display = 'none';
      currentReviewData = null;
    }

    function removeImagePreview() {
      document.getElementById('reviewImage').value = '';
      document.getElementById('imagePreview').style.display = 'none';
    }

    // 이미지 미리보기 기능
    document.addEventListener('DOMContentLoaded', function() {
      const imageInput = document.getElementById('reviewImage');
      const imagePreview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');

      imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'flex';
          };
          reader.readAsDataURL(file);
        }
      });

      // 리뷰 폼 제출 처리
      document.getElementById('reviewForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentReviewData) {
          alert('리뷰 데이터가 없습니다.');
          return;
        }

        const formData = new FormData();
        formData.append('productId', currentReviewData.productId);
        formData.append('orderId', currentReviewData.orderId);
        formData.append('orderItemId', currentReviewData.orderItemId);
        formData.append('title', document.getElementById('reviewTitle').value);
        formData.append('score', document.querySelector('input[name="score"]:checked').value);
        formData.append('content', document.getElementById('reviewContent').value);

        const imageFile = document.getElementById('reviewImage').files[0];
        if (imageFile) {
          formData.append('image', imageFile);
        }

        try {
          const response = await fetch('/api/review/save', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          
          if (result.header && result.header.rtcd === 'S00') {
            alert('리뷰가 성공적으로 등록되었습니다.');
            closeReviewModal();
            // 페이지 새로고침하여 리뷰 버튼 상태 업데이트
            location.reload();
          } else {
            alert('리뷰 등록에 실패했습니다: ' + (result.header?.rtmsg || '알 수 없는 오류'));
          }
        } catch (error) {
          console.error('리뷰 등록 오류:', error);
          alert('리뷰 등록 중 오류가 발생했습니다.');
        }
      });

      // 모달 외부 클릭 시 닫기
      document.getElementById('reviewModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeReviewModal();
        }
      });
    });

    // ===== 초기화 =====
    document.addEventListener('DOMContentLoaded', () => {
      const orderHistoryManager = new OrderHistoryManager();
      
      // 페이지 통계 수집
      setTimeout(() => {
        orderHistoryManager.trackPageView();
      }, 1000);
    });
  