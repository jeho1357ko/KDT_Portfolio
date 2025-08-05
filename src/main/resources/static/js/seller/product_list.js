
// ===== 상수 정의 =====
const API_ENDPOINTS = {
  PRODUCT_STATUS: '/seller/api/product/status'
};

const STATUS_TYPES = {
  SELLING: '판매중',
  DISABLED: '비활성화',
  OUT_OF_STOCK: '재고소진'
};

/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';
  
  // 이미지 컨테이너에 오류 메시지 추가
  const container = img.closest('tr') || img.parentElement;
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

// ===== 클래스 정의 =====
class ProductListManager {
  constructor() {
    this.selectAllCheckbox = document.getElementById('selectAll');
    this.productCheckboxes = document.querySelectorAll('input[name="productIds"]');
    this.bulkStatusSelect = document.getElementById('bulkStatusSelect');
    this.productActionForm = document.getElementById('productActionForm');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupImageErrorHandling();
  }

  setupImageErrorHandling() {
    // 상품 이미지 오류 처리
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(img => {
      img.addEventListener('error', function() {
        handleImageError(this);
      });
    });
  }

  bindEvents() {
    // 전체 선택 체크박스
    this.selectAllCheckbox.addEventListener('change', (event) => {
      console.log('전체 선택 체크박스 변경됨:', event.target.checked);
      this.handleSelectAll();
    });
    
    // 개별 체크박스 변경 시 전체 선택 상태 업데이트
    this.productCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        console.log('개별 체크박스 변경됨');
        this.updateSelectAllState();
      });
    });

    // 일괄 상태 변경 드롭다운
    this.bulkStatusSelect.addEventListener('change', (event) => {
      console.log('상태 변경 드롭다운 변경됨:', event.target.value);
      this.updateBulkStatusSelect();
    });
  }

  handleSelectAll() {
    const isChecked = this.selectAllCheckbox.checked;
    console.log('전체 선택 처리:', isChecked);
    
    this.productCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    
    // 상태 변경 드롭다운 상태 업데이트
    this.updateSelectAllState();
    
    console.log('전체 선택 완료, 체크된 상품 개수:', 
      Array.from(this.productCheckboxes).filter(cb => cb.checked).length);
  }

  updateSelectAllState() {
    const checkedCount = Array.from(this.productCheckboxes).filter(cb => cb.checked).length;
    const totalCount = this.productCheckboxes.length;
    
    this.selectAllCheckbox.checked = checkedCount === totalCount;
    this.selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
    
    this.updateBulkStatusSelectState();
  }

  updateBulkStatusSelectState() {
    const checkedCount = Array.from(this.productCheckboxes).filter(cb => cb.checked).length;
    console.log('체크된 상품 개수:', checkedCount);
    this.bulkStatusSelect.disabled = checkedCount === 0;
  }

  updateBulkStatusSelect() {
    const selectedValue = this.bulkStatusSelect.value;
    const checkedCount = Array.from(this.productCheckboxes).filter(cb => cb.checked).length;
    
    console.log('상태 변경 드롭다운 변경:', { selectedValue, checkedCount });
    
    if (selectedValue && checkedCount > 0) {
      console.log('일괄 상태 변경 시작:', selectedValue);
      this.handleBulkStatusChange(selectedValue);
    } else if (selectedValue && checkedCount === 0) {
      alert('선택된 상품이 없습니다. 상품을 선택한 후 다시 시도해주세요.');
    }
    
    // 드롭다운 초기화
    setTimeout(() => {
      this.bulkStatusSelect.value = '';
    }, 100);
  }

  async handleBulkStatusChange(newStatus) {
    const checkedCheckboxes = Array.from(this.productCheckboxes).filter(cb => cb.checked);
    const productIds = checkedCheckboxes.map(cb => Number(cb.value));
    
    console.log('일괄 상태 변경 처리:', { newStatus, productIds });
    
    if (productIds.length === 0) {
      alert('선택된 상품이 없습니다.');
      return;
    }

    const confirmMessage = `선택된 ${productIds.length}개의 상품을 '${newStatus}'로 변경하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    // 로딩 상태 표시
    this.bulkStatusSelect.disabled = true;
    this.bulkStatusSelect.classList.add('loading');

    try {
      const requestData = {
        productIds: productIds,
        status: newStatus
      };

      console.log('API 요청 데이터:', requestData);

      const response = await fetch('/seller/api/product/bulk-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('API 응답 상태:', response.status);

      const result = await response.json();
      console.log('API 응답 데이터:', result);

      if (result.header && result.header.rtcd === 'S00') {
        // 성공 시 테이블의 상태 드롭다운 업데이트
        checkedCheckboxes.forEach(checkbox => {
          const row = checkbox.closest('tr');
          const statusSelect = row.querySelector('.status-select');
          if (statusSelect) {
            statusSelect.value = newStatus;
            statusSelect.className = `status-select ${newStatus}`;
            statusSelect.setAttribute('data-original-status', newStatus);
          }
        });

        // 체크박스 선택 해제
        checkedCheckboxes.forEach(cb => cb.checked = false);
        this.updateSelectAllState();
        
        alert(`${productIds.length}개의 상품 상태가 성공적으로 변경되었습니다.`);
      } else {
        const errorMsg = result.header ? result.header.rtmsg : (result.message || '알 수 없는 오류');
        alert('상품 상태 변경에 실패했습니다: ' + errorMsg);
      }
    } catch (error) {
      console.error('일괄 상태 변경 중 오류:', error);
      alert('상품 상태 변경 중 오류가 발생했습니다.');
    } finally {
      // 로딩 상태 해제
      this.bulkStatusSelect.disabled = false;
      this.bulkStatusSelect.classList.remove('loading');
    }
  }
}

// ===== 상품 상태 업데이트 함수 =====
async function updateProductStatus(selectElement) {
  const productId = selectElement.getAttribute('data-product-id');
  const newStatus = selectElement.value;
  const originalStatus = selectElement.getAttribute('data-original-status') || newStatus;
  
  console.log('상품 상태 업데이트 시작:', { productId, newStatus, originalStatus });
  
  // 로딩 상태 표시
  selectElement.disabled = true;
  selectElement.classList.add('loading');
  
  try {
    const requestData = {
      productId: productId,
      status: newStatus
    };
    
    console.log('요청 데이터:', requestData);
    
    const response = await fetch(API_ENDPOINTS.PRODUCT_STATUS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(requestData)
    });
    
    console.log('API 응답 상태:', response.status);
    const result = await response.json();
    console.log('API 응답 데이터:', result);
    
    if (result.header && result.header.rtcd === 'S00') {
      // 성공 시 드롭다운 스타일 업데이트
      selectElement.className = `status-select ${newStatus}`;
      selectElement.setAttribute('data-original-status', newStatus);
      console.log('상품 상태가 성공적으로 업데이트되었습니다.');
    } else {
      // 실패 시 원래 값으로 되돌리기
      const errorMsg = result.header ? result.header.rtmsg : (result.message || '알 수 없는 오류');
      console.error('상품 상태 업데이트 실패:', errorMsg);
      alert('상품 상태 업데이트에 실패했습니다: ' + errorMsg);
      selectElement.value = originalStatus;
      selectElement.className = `status-select ${originalStatus}`;
    }
  } catch (error) {
    console.error('상품 상태 업데이트 중 오류:', error);
    alert('상품 상태 업데이트 중 오류가 발생했습니다.');
    selectElement.value = originalStatus;
    selectElement.className = `status-select ${originalStatus}`;
  } finally {
    // 로딩 상태 해제
    selectElement.disabled = false;
    selectElement.classList.remove('loading');
  }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  new ProductListManager();
  
  // 초기 상태 설정
  const statusSelects = document.querySelectorAll('.status-select');
  statusSelects.forEach(select => {
    select.setAttribute('data-original-status', select.value);
  });
});
