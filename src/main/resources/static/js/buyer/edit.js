/**
 * 구매자 정보 수정 페이지 JavaScript 모듈
 * 정보 수정 폼 검증, 주소 검색, 폼 제출 기능을 담당
 */

// ===== 상수 정의 =====
const VALIDATION_RULES = {
  nickname: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[가-힣a-zA-Z0-9]+$/
  },
  phone: {
    required: true,
    pattern: /^010-\d{4}-\d{4}$/
  },
  birth: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  }
};

const SELECTORS = {
  FORM: '.edit-form',
  TEL_INPUT: '#tel',
  NICKNAME_INPUT: '#nickname',
  GENDER_SELECT: '#gender',
  BIRTH_INPUT: '#birth',
  DETAIL_ADDRESS_INPUT: '#detailAddress',
  ADDRESS_INPUT: '#address',
  POST_NUMBER_INPUT: '#postNumber',
  FULL_ADDRESS_INPUT: '#fullAddress',
  SAVE_BTN: '.save-btn',
  CANCEL_BTN: '.cancel-btn'
};

// ===== 유틸리티 함수 =====
const Utils = {
  /**
   * 전화번호에 자동으로 하이픈을 추가합니다.
   * @param {HTMLInputElement} input - 전화번호 입력 필드
   */
  formatPhoneNumber(input) {
    let value = input.value.replace(/[^\d]/g, '');
    
    if (value.length <= 3) {
      input.value = value;
    } else if (value.length <= 7) {
      input.value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
      input.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
  },

  /**
   * 메시지를 표시합니다.
   * @param {string} message - 표시할 메시지
   * @param {string} type - 메시지 타입 ('success' 또는 'error')
   * @param {HTMLElement} container - 메시지를 표시할 컨테이너
   */
  showMessage(message, type, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    
    container.insertBefore(messageDiv, container.firstChild);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  },

  /**
   * 로딩 상태를 설정합니다.
   * @param {HTMLButtonElement} button - 로딩 상태를 설정할 버튼
   * @param {boolean} isLoading - 로딩 상태 여부
   */
  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.textContent = '저장 중...';
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.textContent = '저장';
      button.classList.remove('loading');
    }
  }
};

// ===== 폼 유효성 검사 클래스 =====
class FormValidator {
  constructor() {
    this.form = null;
  }

  /**
   * 폼을 설정합니다.
   * @param {HTMLFormElement} form - 검사할 폼 요소
   */
  setForm(form) {
    this.form = form;
  }

  /**
   * 전체 폼을 검증합니다.
   * @returns {boolean} 검증 결과
   */
  validateForm() {
    const nickname = document.getElementById('nickname').value;
    const phone = document.getElementById('tel').value;
    const birth = document.getElementById('birth').value;
    
    const nicknameResult = this.validateNickname(nickname);
    const phoneResult = this.validatePhone(phone);
    const birthResult = this.validateBirth(birth);
    
    return nicknameResult && phoneResult && birthResult;
  }

  /**
   * 닉네임을 검증합니다.
   * @param {string} value - 검증할 닉네임
   * @returns {boolean} 검증 결과
   */
  validateNickname(value) {
    const rules = VALIDATION_RULES.nickname;
    
    if (rules.required && !value.trim()) {
      this.showFieldError('nickname', '닉네임을 입력해주세요.');
      return false;
    }
    
    if (value.length < rules.minLength) {
      this.showFieldError('nickname', `닉네임은 최소 ${rules.minLength}자 이상이어야 합니다.`);
      return false;
    }
    
    if (value.length > rules.maxLength) {
      this.showFieldError('nickname', `닉네임은 최대 ${rules.maxLength}자까지 가능합니다.`);
      return false;
    }
    
    if (!rules.pattern.test(value)) {
      this.showFieldError('nickname', '닉네임은 한글, 영문, 숫자만 사용 가능합니다.');
      return false;
    }
    
    this.clearFieldError('nickname');
    return true;
  }

  /**
   * 전화번호를 검증합니다.
   * @param {string} value - 검증할 전화번호
   * @returns {boolean} 검증 결과
   */
  validatePhone(value) {
    const rules = VALIDATION_RULES.phone;
    
    if (rules.required && !value.trim()) {
      this.showFieldError('tel', '연락처를 입력해주세요.');
      return false;
    }
    
    if (!rules.pattern.test(value)) {
      this.showFieldError('tel', '연락처는 010-0000-0000 형식으로 입력해주세요.');
      return false;
    }
    
    this.clearFieldError('tel');
    return true;
  }

  /**
   * 생년월일을 검증합니다.
   * @param {string} value - 검증할 생년월일
   * @returns {boolean} 검증 결과
   */
  validateBirth(value) {
    if (!value) return true; // 선택사항
    
    const rules = VALIDATION_RULES.birth;
    
    if (!rules.pattern.test(value)) {
      this.showFieldError('birth', '올바른 날짜 형식으로 입력해주세요.');
      return false;
    }
    
    const birthDate = new Date(value);
    const today = new Date();
    
    if (birthDate > today) {
      this.showFieldError('birth', '생년월일은 오늘 날짜보다 이전이어야 합니다.');
      return false;
    }
    
    this.clearFieldError('birth');
    return true;
  }

  /**
   * 필드 에러를 표시합니다.
   * @param {string} fieldId - 필드 ID
   * @param {string} message - 에러 메시지
   */
  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
    
    field.classList.add('error');
  }

  /**
   * 필드 에러를 제거합니다.
   * @param {string} fieldId - 필드 ID
   */
  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
    
    field.classList.remove('error');
  }
}

// ===== 주소 관리자 클래스 =====
class AddressManager {
  constructor() {
    this.elements = {
      postNumber: document.getElementById('postNumber'),
      address: document.getElementById('address'),
      detailAddress: document.getElementById('detailAddress'),
      fullAddress: document.getElementById('fullAddress'),
      searchBtn: document.getElementById('searchPostcodeBtn')
    };
    
    this.bindEvents();
  }

  /**
   * 이벤트 리스너들을 바인딩합니다.
   */
  bindEvents() {
    // 주소 입력 변경 시 fullAddress 업데이트
    this.elements.detailAddress.addEventListener('input', () => {
      this.updateFullAddress();
    });
    
    this.elements.address.addEventListener('input', () => {
      this.updateFullAddress();
    });
  }

  /**
   * 주소 검색 팝업을 엽니다.
   */
  openAddressPopup() {
    new daum.Postcode({
      oncomplete: (data) => {
        this.handleAddressComplete(data);
      },
      onclose: () => {
        console.log('주소 검색 팝업이 닫혔습니다.');
      }
    }).open();
  }

  /**
   * 주소 검색 완료를 처리합니다.
   * @param {Object} data - 주소 검색 결과 데이터
   */
  handleAddressComplete(data) {
    const postNumber = data.zonecode;
    const roadAddr = data.roadAddress;
    const jibunAddr = data.jibunAddress;
    const baseAddr = roadAddr || jibunAddr;

    this.elements.postNumber.value = postNumber;
    this.elements.address.value = baseAddr;

    // 상세주소 필드로 포커스 이동
    this.elements.detailAddress.focus();
    
    // fullAddress 업데이트
    this.updateFullAddress();
    
    console.log('주소 검색 완료:', { postNumber, baseAddr });
  }

  /**
   * 전체 주소를 업데이트합니다.
   */
  updateFullAddress() {
    const baseAddr = this.elements.address.value.trim();
    const detail = this.elements.detailAddress.value.trim();
    const fullAddress = baseAddr + ' ' + detail;
    
    this.elements.fullAddress.value = fullAddress;
  }

  /**
   * 주소 유효성을 검사합니다.
   * @returns {Object} 검사 결과
   */
  validateAddress() {
    const postNumber = this.elements.postNumber.value.trim();
    const address = this.elements.address.value.trim();
    const detailAddress = this.elements.detailAddress.value.trim();
    
    if (!postNumber) {
      return { isValid: false, message: '우편번호를 검색해주세요.' };
    }
    
    if (!address) {
      return { isValid: false, message: '주소를 검색해주세요.' };
    }
    
    if (!detailAddress) {
      return { isValid: false, message: '상세주소를 입력해주세요.' };
    }
    
    return { isValid: true };
  }
}

// ===== 구매자 정보 편집 관리자 클래스 =====
class BuyerEditManager {
  constructor() {
    this.elements = this.initializeElements();
    this.addressManager = new AddressManager();
    this.formValidator = new FormValidator();
    
    this.initialize();
  }

  /**
   * DOM 요소들을 초기화합니다.
   * @returns {Object} 초기화된 DOM 요소들
   */
  initializeElements() {
    return {
      form: document.querySelector(SELECTORS.FORM),
      telInput: document.querySelector(SELECTORS.TEL_INPUT),
      nicknameInput: document.querySelector(SELECTORS.NICKNAME_INPUT),
      genderSelect: document.querySelector(SELECTORS.GENDER_SELECT),
      birthInput: document.querySelector(SELECTORS.BIRTH_INPUT),
      detailAddressInput: document.querySelector(SELECTORS.DETAIL_ADDRESS_INPUT),
      addressInput: document.querySelector(SELECTORS.ADDRESS_INPUT),
      postNumberInput: document.querySelector(SELECTORS.POST_NUMBER_INPUT),
      fullAddressInput: document.querySelector(SELECTORS.FULL_ADDRESS_INPUT),
      saveBtn: document.querySelector(SELECTORS.SAVE_BTN),
      cancelBtn: document.querySelector(SELECTORS.CANCEL_BTN)
    };
  }

  /**
   * 페이지를 초기화합니다.
   */
  initialize() {
    console.log('=== 구매자 정보 편집 페이지 초기화 ===');
    
    try {
      this.bindEvents();
      this.setupFormValidation();
      this.setupAccessibility();
      
      console.log('구매자 정보 편집 페이지 초기화 완료');
    } catch (error) {
      console.error('구매자 정보 편집 페이지 초기화 중 오류:', error);
    }
  }

  /**
   * 이벤트 리스너들을 바인딩합니다.
   */
  bindEvents() {
    // 폼 제출 이벤트
    this.elements.form.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });

    // 전화번호 자동 하이픈
    this.elements.telInput.addEventListener('input', (e) => {
      Utils.formatPhoneNumber(e.target);
    });

    // 키보드 네비게이션
    this.setupKeyboardNavigation();

    // 실시간 유효성 검사
    this.setupRealTimeValidation();
  }

  /**
   * 폼 제출을 처리합니다.
   * @param {Event} e - 이벤트 객체
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.formValidator.validateForm()) {
      return;
    }

    try {
      Utils.setLoadingState(this.elements.saveBtn, true);
      
      // 폼 데이터 수집
      const formData = this.collectFormData();
      
      // 서버로 제출
      const response = await this.submitForm(formData);
      
      if (response.success) {
        Utils.showMessage('정보가 성공적으로 수정되었습니다.', 'success', this.elements.form);
        setTimeout(() => {
          window.location.href = '/buyer/info';
        }, 1500);
      } else {
        Utils.showMessage(response.message || '정보 수정에 실패했습니다.', 'error', this.elements.form);
      }
    } catch (error) {
      console.error('폼 제출 중 오류:', error);
      Utils.showMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error', this.elements.form);
    } finally {
      Utils.setLoadingState(this.elements.saveBtn, false);
    }
  }

  /**
   * 폼 데이터를 수집합니다.
   * @returns {FormData} 수집된 폼 데이터
   */
  collectFormData() {
    const formData = new FormData(this.elements.form);
    
    // 주소 정보 결합
    const baseAddr = this.elements.addressInput.value.trim();
    const detail = this.elements.detailAddressInput.value.trim();
    const fullAddress = baseAddr + ' ' + detail;
    
    formData.set('address', fullAddress);
    
    return formData;
  }

  /**
   * 폼을 서버로 제출합니다.
   * @param {FormData} formData - 제출할 폼 데이터
   * @returns {Promise<Object>} 서버 응답
   */
  async submitForm(formData) {
    const response = await fetch('/buyer/edit', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 키보드 네비게이션을 설정합니다.
   */
  setupKeyboardNavigation() {
    const inputs = this.elements.form.querySelectorAll('input, select');
    
    inputs.forEach((input, index) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          
          // 다음 입력 필드로 이동
          const nextInput = inputs[index + 1];
          if (nextInput) {
            nextInput.focus();
          } else {
            // 마지막 필드에서 Enter 시 저장 버튼 클릭
            this.elements.saveBtn.click();
          }
        }
      });
    });
  }

  /**
   * 실시간 유효성 검사를 설정합니다.
   */
  setupRealTimeValidation() {
    // 닉네임 검사
    this.elements.nicknameInput.addEventListener('blur', () => {
      this.formValidator.validateNickname(this.elements.nicknameInput.value);
    });

    // 전화번호 검사
    this.elements.telInput.addEventListener('blur', () => {
      this.formValidator.validatePhone(this.elements.telInput.value);
    });

    // 생년월일 검사
    this.elements.birthInput.addEventListener('blur', () => {
      this.formValidator.validateBirth(this.elements.birthInput.value);
    });
  }

  /**
   * 폼 유효성 검사를 설정합니다.
   */
  setupFormValidation() {
    this.formValidator.setForm(this.elements.form);
  }

  /**
   * 접근성을 설정합니다.
   */
  setupAccessibility() {
    // 필수 필드 표시
    const requiredFields = this.elements.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      const label = this.elements.form.querySelector(`label[for="${field.id}"]`);
      if (label) {
        label.classList.add('required');
      }
    });

    // 에러 메시지 접근성
    const errorMessages = this.elements.form.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
      message.setAttribute('role', 'alert');
      message.setAttribute('aria-live', 'polite');
    });
  }

  /**
   * 페이지 통계를 수집합니다.
   */
  trackPageView() {
    console.log('구매자 정보 편집 페이지 조회');
    // Google Analytics나 다른 분석 도구 연동 가능
  }
}

// ===== 전역 함수 =====
/**
 * 마이페이지로 이동합니다.
 */
function goToMyPage() {
  window.location.href = '/buyer/info';
}

/**
 * 홈페이지로 이동합니다.
 */
function goToHome() {
  window.location.href = '/home';
}

// ===== 페이지 초기화 =====
/**
 * 페이지 초기화를 수행합니다.
 */
function initializePage() {
  const buyerEditManager = new BuyerEditManager();
  
  // 페이지 통계 수집
  setTimeout(() => {
    buyerEditManager.trackPageView();
  }, 1000);
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializePage);
 