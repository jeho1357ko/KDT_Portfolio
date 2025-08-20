/**
 * 판매자 상품 목록 JavaScript 모듈
 * 상품 목록 관리, 일괄 상태 변경, 개별 상태 업데이트, 날짜 포맷팅 기능을 담당
 */

// ===== 상수 정의 =====
const API_ENDPOINTS = {
  PRODUCT_STATUS: '/seller/api/product/status',
  BULK_STATUS: '/seller/api/product/bulk-status'
};

const STATUS_TYPES = {
  SELLING: '판매중',
  DISABLED: '비활성화',
  OUT_OF_STOCK: '재고소진'
};

// ===== 유틸리티 함수들 =====

/**
 * 이미지 로드 실패 처리 함수
 * @param {HTMLImageElement} img - 이미지 요소
 */
function handleImageError(img) {
  // 기본 이미지로 대체 (CSS로 처리)
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA0MEM2MCAzNS41ODE3IDY0LjU4MTcgMzEgNzAgMzFDNzUuNDE4MyAzMSA4MCAzNS41ODE3IDgwIDQwQzgwIDQ0LjQxODMgNzUuNDE4MyA0OSA3MCA0OUM2NC41ODE3IDQ5IDYwIDQ0LjQxODMgNjAgNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0zMCA4MEMzMCA3NS41ODE3IDM0LjU4MTcgNzEgNDAgNzFINDVINDVDNTAuNDE4MyA3MSA1NSA3NS41ODE3IDU1IDgwQzU1IDg0LjQxODMgNTAuNDE4MyA4OSA0NSA4OUg0MEMzNC41ODE3IDg5IDMwIDg0LjQxODMgMzAgODBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik04MCA4MEM4MCA3NS41ODE3IDg0LjU4MTcgNzEgOTAgNzFDOTUuNDE4MyA3MSAxMDAgNzUuNTgxNyAxMDAgODBDMTAwIDg0LjQxODMgOTUuNDE4MyA4OSA5MCA4OUM4NC41ODE3IDg5IDgwIDg0LjQxODMgODAgODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';
  img.alt = '상품 이미지';
  
  this.showImageErrorMessage(img);
}

/**
 * 이미지 오류 메시지 표시
 * @param {HTMLImageElement} img - 이미지 요소
 */
function showImageErrorMessage(img) {
  const container = img.closest('tr') || img.parentElement;
  if (!container) return;

  // 기존 오류 메시지가 있는지 확인
  let errorMessage = container.querySelector('.image-error-message');
  
  if (!errorMessage) {
    errorMessage = this.createErrorMessage();
    container.appendChild(errorMessage);
    
    // 3초 후 메시지 숨기기
    setTimeout(() => this.hideErrorMessage(errorMessage), 3000);
  }
}

/**
 * 오류 메시지 요소 생성
 * @returns {HTMLElement} 오류 메시지 요소
 */
function createErrorMessage() {
  const errorMessage = document.createElement('div');
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
  
  return errorMessage;
}

/**
 * 오류 메시지 숨기기
 * @param {HTMLElement} errorMessage - 오류 메시지 요소
 */
function hideErrorMessage(errorMessage) {
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

// ===== 상품 목록 관리 클래스 =====
class ProductListManager {
  /**
   * 상품 목록 관리자 생성
   */
  constructor() {
    this.initializeElements();
    this.init();
  }

  /**
   * DOM 요소 초기화
   */
  initializeElements() {
    this.selectAllCheckbox = document.getElementById('selectAll');
    this.productCheckboxes = document.querySelectorAll('input[name="productIds"]');
    this.bulkStatusSelect = document.getElementById('bulkStatusSelect');
    this.productActionForm = document.getElementById('productActionForm');
    
    this.validateElements();
  }

  /**
   * 필수 DOM 요소 존재 여부 검증
   */
  validateElements() {
    const requiredElements = [
      this.selectAllCheckbox,
      this.bulkStatusSelect,
      this.productActionForm
    ];

    for (const element of requiredElements) {
      if (!element) {
        throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
      }
    }
  }

  /**
   * 초기화
   */
  init() {
    this.bindEvents();
    this.setupImageErrorHandling();
    this.initializeStatusSelects();
    this.initializeDateFormatting();
  }

  /**
   * 이미지 오류 처리 설정
   */
  setupImageErrorHandling() {
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(img => {
      img.addEventListener('error', function() {
        handleImageError(this);
      });
    });
  }

  /**
   * 상태 선택 요소 초기화
   */
  initializeStatusSelects() {
    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
      select.setAttribute('data-original-status', select.value);
    });
  }

  /**
   * 날짜 포맷팅 초기화
   */
  initializeDateFormatting() {
    const dateColumns = document.querySelectorAll('.date-column');
    dateColumns.forEach(cell => {
      const originalDate = cell.textContent.trim();
      if (originalDate && originalDate !== '25-08-20 09:49') {
        const formattedDate = this.formatDate(originalDate);
        cell.textContent = formattedDate;
      }
    });
  }

  /**
   * 날짜 포맷팅 함수
   * @param {string} dateString - 포맷팅할 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // 유효하지 않은 날짜면 원본 반환
      }
      
      const year = date.getFullYear().toString().slice(-2); // 2자리 연도
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString; // 오류 발생 시 원본 반환
    }
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    this.bindCheckboxEvents();
    this.bindBulkStatusEvents();
  }

  /**
   * 체크박스 이벤트 바인딩
   */
  bindCheckboxEvents() {
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
  }

  /**
   * 일괄 상태 변경 이벤트 바인딩
   */
  bindBulkStatusEvents() {
    this.bulkStatusSelect.addEventListener('change', (event) => {
      console.log('상태 변경 드롭다운 변경됨:', event.target.value);
      this.handleBulkStatusChange(event.target.value);
    });
  }

  /**
   * 전체 선택 처리
   */
  handleSelectAll() {
    const isChecked = this.selectAllCheckbox.checked;
    console.log('전체 선택 처리:', isChecked);
    
    this.productCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    
    this.updateSelectAllState();
    
    console.log('전체 선택 완료, 체크된 상품 개수:', 
      this.getCheckedCount());
  }

  /**
   * 전체 선택 상태 업데이트
   */
  updateSelectAllState() {
    const checkedCount = this.getCheckedCount();
    const totalCount = this.productCheckboxes.length;
    
    this.selectAllCheckbox.checked = checkedCount === totalCount;
    this.selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
    
    this.updateBulkStatusSelectState();
  }

  /**
   * 체크된 상품 개수 반환
   * @returns {number} 체크된 상품 개수
   */
  getCheckedCount() {
    return Array.from(this.productCheckboxes).filter(cb => cb.checked).length;
  }

  /**
   * 일괄 상태 변경 드롭다운 상태 업데이트
   */
  updateBulkStatusSelectState() {
    const checkedCount = this.getCheckedCount();
    console.log('체크된 상품 개수:', checkedCount);
    this.bulkStatusSelect.disabled = checkedCount === 0;
  }

  /**
   * 일괄 상태 변경 처리
   * @param {string} selectedValue - 선택된 상태 값
   */
  handleBulkStatusChange(selectedValue) {
    const checkedCount = this.getCheckedCount();
    
    console.log('상태 변경 드롭다운 변경:', { selectedValue, checkedCount });
    
    if (selectedValue && checkedCount > 0) {
      console.log('일괄 상태 변경 시작:', selectedValue);
      this.performBulkStatusChange(selectedValue);
    } else if (selectedValue && checkedCount === 0) {
      alert('선택된 상품이 없습니다. 상품을 선택한 후 다시 시도해주세요.');
    }
    
    // 드롭다운 초기화
    setTimeout(() => {
      this.bulkStatusSelect.value = '';
    }, 100);
  }

  /**
   * 일괄 상태 변경 실행
   * @param {string} newStatus - 새로운 상태
   */
  async performBulkStatusChange(newStatus) {
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

    this.showBulkStatusLoading();

    try {
      const result = await this.sendBulkStatusRequest(productIds, newStatus);
      
      if (result.success) {
        this.updateBulkStatusUI(checkedCheckboxes, newStatus);
        this.resetCheckboxes(checkedCheckboxes);
        alert(`${productIds.length}개의 상품 상태가 성공적으로 변경되었습니다.`);
      } else {
        alert('상품 상태 변경에 실패했습니다: ' + result.errorMessage);
      }
    } catch (error) {
      console.error('일괄 상태 변경 중 오류:', error);
      alert('상품 상태 변경 중 오류가 발생했습니다.');
    } finally {
      this.hideBulkStatusLoading();
    }
  }

  /**
   * 일괄 상태 변경 요청 전송
   * @param {Array<number>} productIds - 상품 ID 배열
   * @param {string} newStatus - 새로운 상태
   * @returns {Promise<Object>} 응답 결과
   */
  async sendBulkStatusRequest(productIds, newStatus) {
    const requestData = {
      productIds: productIds,
      status: newStatus
    };

    console.log('API 요청 데이터:', requestData);

    const response = await fetch(API_ENDPOINTS.BULK_STATUS, {
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
      return { success: true };
    } else {
      const errorMsg = result.header ? result.header.rtmsg : (result.message || '알 수 없는 오류');
      return { success: false, errorMessage: errorMsg };
    }
  }

  /**
   * 일괄 상태 변경 UI 업데이트
   * @param {Array<HTMLInputElement>} checkedCheckboxes - 체크된 체크박스들
   * @param {string} newStatus - 새로운 상태
   */
  updateBulkStatusUI(checkedCheckboxes, newStatus) {
    checkedCheckboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const statusSelect = row.querySelector('.status-select');
      if (statusSelect) {
        statusSelect.value = newStatus;
        statusSelect.className = `status-select ${newStatus}`;
        statusSelect.setAttribute('data-original-status', newStatus);
      }
    });
  }

  /**
   * 체크박스 초기화
   * @param {Array<HTMLInputElement>} checkedCheckboxes - 체크된 체크박스들
   */
  resetCheckboxes(checkedCheckboxes) {
    checkedCheckboxes.forEach(cb => cb.checked = false);
    this.updateSelectAllState();
  }

  /**
   * 일괄 상태 변경 로딩 상태 표시
   */
  showBulkStatusLoading() {
    this.bulkStatusSelect.disabled = true;
    this.bulkStatusSelect.classList.add('loading');
  }

  /**
   * 일괄 상태 변경 로딩 상태 해제
   */
  hideBulkStatusLoading() {
    this.bulkStatusSelect.disabled = false;
    this.bulkStatusSelect.classList.remove('loading');
  }
}

// ===== 개별 상품 상태 업데이트 함수 =====

/**
 * 개별 상품 상태 업데이트
 * @param {HTMLSelectElement} selectElement - 상태 선택 요소
 */
async function updateProductStatus(selectElement) {
  const productId = selectElement.getAttribute('data-product-id');
  const newStatus = selectElement.value;
  const originalStatus = selectElement.getAttribute('data-original-status') || newStatus;
  
  console.log('상품 상태 업데이트 시작:', { productId, newStatus, originalStatus });
  
  showProductStatusLoading(selectElement);
  
  try {
    const result = await sendProductStatusRequest(productId, newStatus);
    
    if (result.success) {
      updateProductStatusUI(selectElement, newStatus);
      console.log('상품 상태가 성공적으로 업데이트되었습니다.');
    } else {
      handleProductStatusError(selectElement, originalStatus, result.errorMessage);
    }
  } catch (error) {
    console.error('상품 상태 업데이트 중 오류:', error);
    handleProductStatusError(selectElement, originalStatus, '상품 상태 업데이트 중 오류가 발생했습니다.');
  } finally {
    hideProductStatusLoading(selectElement);
  }
}

/**
 * 상품 상태 업데이트 요청 전송
 * @param {string} productId - 상품 ID
 * @param {string} newStatus - 새로운 상태
 * @returns {Promise<Object>} 응답 결과
 */
async function sendProductStatusRequest(productId, newStatus) {
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
    return { success: true };
  } else {
    const errorMsg = result.header ? result.header.rtmsg : (result.message || '알 수 없는 오류');
    return { success: false, errorMessage: errorMsg };
  }
}

/**
 * 상품 상태 UI 업데이트
 * @param {HTMLSelectElement} selectElement - 상태 선택 요소
 * @param {string} newStatus - 새로운 상태
 */
function updateProductStatusUI(selectElement, newStatus) {
  selectElement.className = `status-select ${newStatus}`;
  selectElement.setAttribute('data-original-status', newStatus);
}

/**
 * 상품 상태 오류 처리
 * @param {HTMLSelectElement} selectElement - 상태 선택 요소
 * @param {string} originalStatus - 원래 상태
 * @param {string} errorMessage - 오류 메시지
 */
function handleProductStatusError(selectElement, originalStatus, errorMessage) {
  console.error('상품 상태 업데이트 실패:', errorMessage);
  alert('상품 상태 업데이트에 실패했습니다: ' + errorMessage);
  selectElement.value = originalStatus;
  selectElement.className = `status-select ${originalStatus}`;
}

/**
 * 상품 상태 로딩 상태 표시
 * @param {HTMLSelectElement} selectElement - 상태 선택 요소
 */
function showProductStatusLoading(selectElement) {
  selectElement.disabled = true;
  selectElement.classList.add('loading');
}

/**
 * 상품 상태 로딩 상태 해제
 * @param {HTMLSelectElement} selectElement - 상태 선택 요소
 */
function hideProductStatusLoading(selectElement) {
  selectElement.disabled = false;
  selectElement.classList.remove('loading');
}

// ===== 초기화 =====
let productListManager;

document.addEventListener('DOMContentLoaded', () => {
  try {
    productListManager = new ProductListManager();
    console.log('상품 목록 관리자 초기화 완료');
  } catch (error) {
    console.error('ProductListManager 초기화 실패:', error);
  }
});
