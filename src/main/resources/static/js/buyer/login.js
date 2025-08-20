/**
 * 구매자 로그인 페이지 JavaScript 모듈
 * 로그인 폼 검증, 실시간 유효성 검사, 로딩 상태 관리 기능을 담당
 */

/**
 * 유효성 검사 규칙 정의
 */
const VALIDATION_RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 형식을 입력해주세요.'
  },
  password: {
    minLength: 6,
    message: '비밀번호는 6자 이상이어야 합니다.'
  }
};

/**
 * 구매자 로그인 관리자 클래스
 * 로그인 페이지의 모든 기능을 관리합니다.
 */
class BuyerLoginManager {
  constructor() {
    this.isSubmitting = false;
    this.elements = this.initializeElements();
    
    this.initialize();
  }

  /**
   * DOM 요소들을 초기화합니다.
   * @returns {Object} 초기화된 DOM 요소들
   */
  initializeElements() {
    return {
      form: document.getElementById('loginForm'),
      emailInput: document.getElementById('email'),
      passwordInput: document.getElementById('password'),
      loginButton: document.getElementById('loginButton'),
      buttonText: document.querySelector('.button-text')
    };
  }

  /**
   * 페이지를 초기화합니다.
   */
  initialize() {
    console.log('=== 구매자 로그인 페이지 초기화 ===');
    
    try {
      // 실시간 유효성 검사 설정
      this.setupRealTimeValidation();
      
      // 키보드 접근성 설정
      this.setupKeyboardAccessibility();
      
      // 폼 제출 이벤트 설정
      this.setupFormSubmission();
      
      // 서버 에러 처리
      this.handleServerErrors();
      
      // 페이지 가시성 변경 이벤트 설정
      this.setupVisibilityChange();
      
      console.log('구매자 로그인 페이지 초기화 완료');
    } catch (error) {
      console.error('구매자 로그인 페이지 초기화 중 오류:', error);
    }
  }

  /**
   * 이메일 유효성을 검사합니다.
   * @param {string} email - 검사할 이메일
   * @returns {string|null} 에러 메시지 또는 null
   */
  validateEmail(email) {
    if (!email) return '이메일을 입력해주세요.';
    if (!VALIDATION_RULES.email.regex.test(email)) {
      return VALIDATION_RULES.email.message;
    }
    return null;
  }

  /**
   * 비밀번호 유효성을 검사합니다.
   * @param {string} password - 검사할 비밀번호
   * @returns {string|null} 에러 메시지 또는 null
   */
  validatePassword(password) {
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < VALIDATION_RULES.password.minLength) {
      return VALIDATION_RULES.password.message;
    }
    return null;
  }

  /**
   * 에러를 표시합니다.
   * @param {HTMLElement} input - 입력 요소
   * @param {string} message - 에러 메시지
   */
  showError(input, message) {
    const errorElement = document.getElementById(`${input.id}-error`);
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  /**
   * 성공 상태를 표시합니다.
   * @param {HTMLElement} input - 입력 요소
   */
  showSuccess(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    input.classList.remove('error');
    input.classList.add('success');
    errorElement.classList.remove('show');
  }

  /**
   * 입력 필드 유효성을 검사합니다.
   * @param {HTMLElement} input - 검사할 입력 요소
   * @returns {boolean} 유효성 여부
   */
  validateField(input) {
    const value = input.value.trim();
    let error = null;
    
    switch (input.id) {
      case 'email':
        error = this.validateEmail(value);
        break;
      case 'password':
        error = this.validatePassword(value);
        break;
      default:
        return true;
    }
    
    if (error) {
      this.showError(input, error);
      return false;
    } else {
      this.showSuccess(input);
      return true;
    }
  }

  /**
   * 실시간 유효성 검사를 설정합니다.
   */
  setupRealTimeValidation() {
    [this.elements.emailInput, this.elements.passwordInput].forEach(input => {
      // blur 이벤트: 포커스가 벗어날 때 검사
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // input 이벤트: 에러 상태일 때 실시간 검사
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });
  }

  /**
   * 폼 제출을 처리합니다.
   * @param {Event} e - 이벤트 객체
   */
  handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;

    // 모든 필드 유효성 검사
    const isEmailValid = this.validateField(this.elements.emailInput);
    const isPasswordValid = this.validateField(this.elements.passwordInput);

    if (!isEmailValid || !isPasswordValid) {
      // 첫 번째 에러 필드로 포커스
      const firstErrorInput = document.querySelector('.error');
      if (firstErrorInput) {
        firstErrorInput.focus();
      }
      return;
    }

    // 로딩 상태 시작
    this.startLoadingState();

    // 폼 제출 (500ms 지연으로 로딩 상태 표시)
    setTimeout(() => {
      this.elements.form.submit();
    }, 500);
  }

  /**
   * 로딩 상태를 시작합니다.
   */
  startLoadingState() {
    this.isSubmitting = true;
    this.elements.loginButton.classList.add('loading');
    this.elements.loginButton.disabled = true;
    this.elements.buttonText.textContent = '로그인 중...';
  }

  /**
   * 키보드 접근성을 설정합니다.
   */
  setupKeyboardAccessibility() {
    this.elements.form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.isSubmitting) {
        this.handleSubmit(e);
      }
    });
  }

  /**
   * 폼 제출 이벤트를 설정합니다.
   */
  setupFormSubmission() {
    this.elements.form.addEventListener('submit', (e) => {
      this.handleSubmit(e);
    });
  }

  /**
   * 서버 에러를 처리합니다.
   */
  handleServerErrors() {
    // 서버 에러 메시지가 있으면 입력 필드에 에러 스타일 적용
    const serverError = document.querySelector('.server-error-message');
    if (serverError) {
      this.elements.emailInput.classList.add('error');
      this.elements.passwordInput.classList.add('error');
      
      // 에러 메시지가 있을 때 입력 필드 포커스
      setTimeout(() => {
        this.elements.emailInput.focus();
      }, 100);
    }
  }

  /**
   * 페이지 가시성 변경 이벤트를 설정합니다.
   */
  setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('구매자 로그인 페이지가 활성화되었습니다.');
      }
    });
  }

  /**
   * 전역 에러를 처리합니다.
   */
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('페이지 에러 발생:', e);
    });
  }
}

/**
 * 페이지 로드 시 BuyerLoginManager를 초기화합니다.
 */
function initializeLoginPage() {
  const buyerLoginManager = new BuyerLoginManager();
  buyerLoginManager.setupErrorHandling();
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLoginPage);
} else {
  initializeLoginPage();
}
