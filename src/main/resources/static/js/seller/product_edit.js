/**
 * 상품 수정 폼 JavaScript 모듈
 * 폼 유효성 검사, 실시간 검증, 제출 처리 기능을 담당
 */

// ===== 상수 정의 =====
const VALIDATION_RULES = {
  productName: {
    minLength: 2,
    maxLength: 200,
    message: '품종은 2~200자로 입력해주세요.'
  },
  title: {
    minLength: 5,
    maxLength: 200,
    message: '제목은 5~200자로 입력해주세요.'
  },
  content: {
    minLength: 10,
    maxLength: 2000,
    message: '상품 내용은 10~2000자로 입력해주세요.'
  },
  countryOfOrigin: {
    minLength: 2,
    maxLength: 60,
    message: '원산지는 2~60자로 입력해주세요.'
  },
  price: {
    min: 0,
    max: 9999999999,
    message: '가격은 0원 이상 99억원 이하로 입력해주세요.'
  },
  quantity: {
    min: 0,
    max: 9999999999,
    message: '수량은 0개 이상 99억개 이하로 입력해주세요.'
  },
  deliveryFee: {
    min: 0,
    max: 99999,
    message: '배송비는 0원 이상 99,999원 이하로 입력해주세요.'
  },
  deliveryMethod: {
    maxLength: 30,
    message: '배송 방법은 30자 이하로 입력해주세요.'
  },
  deliveryInformation: {
    maxLength: 200,
    message: '배송 안내는 200자 이하로 입력해주세요.'
  }
};

// ===== 상품 수정 폼 관리 클래스 =====
class ProductEditManager {
  /**
   * 상품 수정 폼 관리자 생성
   */
  constructor() {
    this.initializeElements();
    this.init();
  }

  /**
   * DOM 요소 초기화
   */
  initializeElements() {
    this.form = document.getElementById('productEditForm');
    this.submitBtn = document.getElementById('submitBtn');
    
    // 폼 그룹 요소들
    this.formGroups = {
      productName: document.getElementById('productNameGroup'),
      title: document.getElementById('titleGroup'),
      content: document.getElementById('contentGroup'),
      countryOfOrigin: document.getElementById('countryOfOriginGroup'),
      price: document.getElementById('priceGroup'),
      quantity: document.getElementById('quantityGroup'),
      status: document.getElementById('statusGroup'),
      thumbnail: document.getElementById('thumbnailGroup'),
      deliveryFee: document.getElementById('deliveryFeeGroup'),
      deliveryMethod: document.getElementById('deliveryMethodGroup'),
      deliveryInformation: document.getElementById('deliveryInformationGroup')
    };

    this.validateElements();
  }

  /**
   * 필수 DOM 요소 존재 여부 검증
   */
  validateElements() {
    if (!this.form || !this.submitBtn) {
      throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
    }
  }

  /**
   * 초기화
   */
  init() {
    this.bindEvents();
    this.setupRealTimeValidation();
    this.initializeForm();
  }

  /**
   * 폼 초기화
   */
  initializeForm() {
    // 초기 상태 설정
    Object.values(this.formGroups).forEach(group => {
      if (group) {
        this.clearFieldError(group);
      }
    });
    

  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    this.bindFormSubmit();
    this.bindInputEvents();
    this.bindKeyboardEvents();
    this.bindFormattingEvents();
  }

  /**
   * 폼 제출 이벤트 바인딩
   */
  bindFormSubmit() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleFormSubmit();
    });
  }

  /**
   * 입력 이벤트 바인딩
   */
  bindInputEvents() {
    // 모든 입력 필드에 이벤트 리스너 추가
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * 키보드 이벤트 바인딩
   */
  bindKeyboardEvents() {
    // Enter 키로 폼 제출 방지
    this.form.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
      }
    });
  }

  /**
   * 포맷팅 이벤트 바인딩
   */
  bindFormattingEvents() {
    // 가격 입력 시 자동 포맷팅
    const priceField = this.form.querySelector('#price');
    if (priceField) {
      priceField.addEventListener('input', (e) => this.limitPriceDigitsAndFormat(e, 10));
    }

    // 수량 입력 시 자동 포맷팅
    const quantityField = this.form.querySelector('#quantity');
    if (quantityField) {
      quantityField.addEventListener('input', (e) => this.formatQuantity(e));
      quantityField.addEventListener('input', (e) => this.limitInputLength(e, 10));
    }

    // 배송비 입력 시 길이 제한
    const deliveryFeeField = this.form.querySelector('#deliveryFee');
    if (deliveryFeeField) {
      deliveryFeeField.addEventListener('input', (e) => this.limitInputLength(e, 5));
    }
  }

  /**
   * 실시간 유효성 검사 설정
   */
  setupRealTimeValidation() {
    // 필수 필드들에 대한 실시간 검증
    const requiredFields = ['productName', 'title', 'content', 'countryOfOrigin', 'price', 'quantity', 'status', 'deliveryFee'];
    
    requiredFields.forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener('input', () => {
          this.validateField(field);
        });
      }
    });
  }

  /**
   * 폼 제출 처리
   */
  async handleFormSubmit() {
    if (!this.validateForm()) {
      this.showFormError('필수 항목을 모두 입력해주세요.');
      this.scrollToFirstError();
      return;
    }

    this.showLoadingState();

    try {
      // 폼 데이터 수집
      const formData = this.collectFormData();
      
      // 서버로 제출
      const response = await this.submitForm(formData);
      
      if (response.success) {
        this.handleSubmitSuccess(response);
      } else {
        this.handleSubmitError(response);
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      this.handleSubmitError({ message: '서버 오류가 발생했습니다.' });
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * 폼 유효성 검사
   * @returns {boolean} 유효성 검사 통과 여부
   */
  validateForm() {
    let isValid = true;
    const requiredFields = ['productName', 'title', 'content', 'countryOfOrigin', 'price', 'quantity', 'status', 'deliveryFee'];
    
    requiredFields.forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * 개별 필드 유효성 검사
   * @param {HTMLElement} field - 검사할 필드 요소
   * @returns {boolean} 유효성 검사 통과 여부
   */
  validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const rule = VALIDATION_RULES[fieldName];
    
    if (!rule) return true;

    // 필수 필드 검사
    if (field.hasAttribute('required') && !value) {
      this.showFieldError(field, '필수 입력 항목입니다.');
      return false;
    }

    // 길이 검사
    if (rule.minLength && value.length < rule.minLength) {
      this.showFieldError(field, rule.message);
      return false;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      this.showFieldError(field, rule.message);
      return false;
    }

    // 숫자 필드 검사
    if (field.type === 'number') {
      const numValue = Number(value.replace(/,/g, ''));
      if (rule.min !== undefined && numValue < rule.min) {
        this.showFieldError(field, rule.message);
        return false;
      }
      if (rule.max !== undefined && numValue > rule.max) {
        this.showFieldError(field, rule.message);
        return false;
      }
    }

    // URL 필드 검사
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        this.showFieldError(field, '올바른 URL 형식을 입력해주세요.');
        return false;
      }
    }

    this.clearFieldError(field);
    return true;
  }

  /**
   * 필드 오류 표시
   * @param {HTMLElement} field - 오류가 발생한 필드
   * @param {string} message - 오류 메시지
   */
  showFieldError(field, message) {
    const fieldName = field.name;
    const formGroup = this.formGroups[fieldName];
    
    if (formGroup) {
      formGroup.classList.add('error');
      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
      }
    }
  }

  /**
   * 필드 오류 제거
   * @param {HTMLElement} field - 오류를 제거할 필드
   */
  clearFieldError(field) {
    const fieldName = field.name;
    const formGroup = this.formGroups[fieldName];
    
    if (formGroup) {
      formGroup.classList.remove('error');
      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    }
  }

  /**
   * 폼 오류 표시
   * @param {string} message - 오류 메시지
   */
  showFormError(message) {
    alert(message);
  }

  /**
   * 첫 번째 에러로 스크롤
   */
  scrollToFirstError() {
    const firstError = document.querySelector('.form-group.error');
    if (firstError) {
      firstError.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      firstError.querySelector('input, select, textarea')?.focus();
    }
  }

  /**
   * 폼 데이터 수집
   * @returns {FormData} 폼 데이터
   */
  collectFormData() {
    const formData = new FormData(this.form);
    // 숫자 필드는 제출 전에 숫자만 남기기
    ['price', 'quantity', 'deliveryFee'].forEach((name) => {
      const field = this.form.querySelector(`[name="${name}"]`);
      if (field) {
        const digitsOnly = field.value.replace(/\D/g, '');
        formData.set(name, digitsOnly);
      }
    });
    return formData;
  }

  /**
   * 폼 제출
   * @param {FormData} formData - 제출할 폼 데이터
   * @returns {Promise<Object>} 응답 결과
   */
  async submitForm(formData) {
    const response = await fetch(this.form.action, {
      method: 'POST',
      body: formData
    });

    if (response.redirected) {
      return { success: true, redirectUrl: response.url };
    }

    const result = await response.json();
    return result;
  }

  /**
   * 제출 성공 처리
   * @param {Object} response - 서버 응답
   */
  handleSubmitSuccess(response) {
    if (response.redirectUrl) {
      window.location.href = response.redirectUrl;
    } else {
      alert('상품이 성공적으로 수정되었습니다.');
      window.location.href = '/seller/list/' + this.getSellerId();
    }
  }

  /**
   * 제출 실패 처리
   * @param {Object} response - 서버 응답
   */
  handleSubmitError(response) {
    const message = response.message || '상품 수정에 실패했습니다.';
    alert(message);
  }

  /**
   * 판매자 ID 가져오기
   * @returns {string} 판매자 ID
   */
  getSellerId() {
    const url = window.location.pathname;
    const match = url.match(/\/seller\/product\/\d+\/edit/);
    if (match) {
      // URL에서 상품 ID를 추출하고, 판매자 ID는 세션이나 다른 방법으로 가져와야 함
      
      return '';
    }
    return '';
  }

  /**
   * 로딩 상태 표시
   */
  showLoadingState() {
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = '수정 중...';
    this.submitBtn.classList.add('loading');
  }

  /**
   * 로딩 상태 해제
   */
  hideLoadingState() {
    this.submitBtn.disabled = false;
    this.submitBtn.textContent = '수정 완료';
    this.submitBtn.classList.remove('loading');
  }

  /**
   * 입력 길이 제한
   * @param {Event} e - 입력 이벤트
   * @param {number} maxLength - 최대 길이
   */
  limitInputLength(e, maxLength) {
    const value = e.target.value;
    if (value.length > maxLength) {
      e.target.value = value.slice(0, maxLength);
    }
  }

  /**
   * 가격 입력 자릿수 제한(숫자 기준) + 포맷팅
   * @param {Event} e - 입력 이벤트
   * @param {number} maxDigits - 허용할 최대 숫자 자릿수
   */
  limitPriceDigitsAndFormat(e, maxDigits) {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > maxDigits) {
      raw = raw.slice(0, maxDigits);
    }
    // number input에 쉼표를 넣지 않고 숫자만 유지
    e.target.value = raw;
  }

  /**
   * 수량 포맷팅
   * @param {Event} e - 입력 이벤트
   */
  formatQuantity(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    e.target.value = value;
  }
}

// ===== 유틸리티 함수들 =====

/**
 * 숫자 포맷팅
 * @param {number} number - 포맷팅할 숫자
 * @returns {string} 포맷팅된 숫자 문자열
 */
function formatNumber(number) {
  return new Intl.NumberFormat('ko-KR').format(number);
}

/**
 * 가격 입력 필드 포맷팅
 * @param {HTMLInputElement} input - 가격 입력 필드
 */
function formatPriceInput(input) {
  const value = input.value.replace(/[^\d]/g, '');
  if (value) {
    input.value = formatNumber(parseInt(value));
  }
}

// ===== 초기화 =====
let productEditManager;

document.addEventListener('DOMContentLoaded', () => {
  try {
    productEditManager = new ProductEditManager();

  } catch (error) {
    console.error('ProductEditManager 초기화 실패:', error);
  }
});
