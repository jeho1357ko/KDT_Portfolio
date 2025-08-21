/**
 * 판매자 로그인 JavaScript 모듈
 * 폼 유효성 검사, 로그인 처리, 에러 핸들링 기능을 담당
 */

// ===== 전역 변수 =====
let isSubmitting = false;

// ===== DOM 요소 =====
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const buttonText = loginButton.querySelector('.button-text');

// ===== 유효성 검사 규칙 =====
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 형식을 입력해주세요.'
  },
  password: {
    required: true,
    minLength: 1, // 비밀번호는 필수이지만 길이 제한은 없음 (컨트롤러에서 확인)
    message: '비밀번호를 입력해주세요.'
  }
};

// ===== 유효성 검사 함수들 =====
const validators = {
  email: (value) => {
    if (!value || value.trim() === '') {
      return '이메일을 입력해주세요.';
    }
    if (!validationRules.email.pattern.test(value.trim())) {
      return validationRules.email.message;
    }
    return null;
  },
  password: (value) => {
    if (!value || value.trim() === '') {
      return '비밀번호를 입력해주세요.';
    }
    return null;
  }
};

// ===== 에러 메시지 관리 =====

/**
 * 에러 메시지 표시
 * @param {HTMLInputElement} input - 에러를 표시할 입력 필드
 * @param {string} message - 표시할 에러 메시지
 */
function showError(input, message) {
  const errorElement = document.getElementById(`${input.id}-error`);
  if (errorElement) {
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

/**
 * 성공 상태 표시
 * @param {HTMLInputElement} input - 성공을 표시할 입력 필드
 */
function showSuccess(input) {
  const errorElement = document.getElementById(`${input.id}-error`);
  if (errorElement) {
    input.classList.remove('error');
    input.classList.add('success');
    errorElement.classList.remove('show');
  }
}

/**
 * 입력 필드 유효성 검사
 * @param {HTMLInputElement} input - 검사할 입력 필드
 * @returns {boolean} 유효성 여부
 */
function validateField(input) {
  const value = input.value.trim();
  const validator = validators[input.id];
  
  if (validator) {
    const error = validator(value);
    if (error) {
      showError(input, error);
      return false;
    } else {
      showSuccess(input);
      return true;
    }
  }
  return true;
}

// ===== 실시간 유효성 검사 =====

/**
 * 실시간 유효성 검사 설정
 */
function setupRealTimeValidation() {
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
  });
}

// ===== 폼 제출 처리 =====

/**
 * 폼 제출 처리
 * @param {Event} e - 제출 이벤트
 */
function handleSubmit(e) {
  e.preventDefault();
  
  if (isSubmitting) return;

  // 모든 필드 유효성 검사
  const isEmailValid = validateField(emailInput);
  const isPasswordValid = validateField(passwordInput);

  if (!isEmailValid || !isPasswordValid) {
    // 첫 번째 에러 필드로 포커스
    const firstErrorInput = document.querySelector('.error');
    if (firstErrorInput) {
      firstErrorInput.focus();
    }
    return;
  }

  // 로딩 상태 시작
  startLoadingState();

  // 폼 제출
  setTimeout(() => {
    loginForm.submit();
  }, 500);
}

/**
 * 로딩 상태 시작
 */
function startLoadingState() {
  isSubmitting = true;
  loginButton.classList.add('loading');
  loginButton.disabled = true;
  buttonText.textContent = '로그인 중...';
}

// ===== 키보드 접근성 =====

/**
 * 키보드 접근성 설정
 */
function setupKeyboardAccessibility() {
  loginForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e);
    }
  });
}

// ===== 서버 에러 처리 =====

/**
 * 서버 에러 메시지 처리
 */
function handleServerError() {
  const serverError = document.getElementById('server-error');
  if (serverError) {
    // 에러 메시지에 따라 입력 필드에 에러 스타일 적용
    emailInput.classList.add('error');
    passwordInput.classList.add('error');
    
    // 에러 메시지가 있을 때 입력 필드 포커스
    setTimeout(() => {
      emailInput.focus();
    }, 100);

    // 에러 메시지 타입에 따른 추가 처리
    const errorText = serverError.textContent.trim();
    processErrorByType(errorText, serverError);
  }
}

/**
 * 에러 타입별 처리
 * @param {string} errorText - 에러 메시지 텍스트
 * @param {HTMLElement} serverError - 서버 에러 요소
 */
function processErrorByType(errorText, serverError) {
  // 에러 메시지 타입에 따른 클래스 추가
  if (errorText.includes('비활성화') || errorText.includes('정지')) {
    serverError.classList.add('account-deactivated');
  }
  
  // 특정 에러 메시지에 따른 필드별 에러 표시
  if (errorText.includes('존재하지 않는 이메일')) {
    showError(emailInput, '존재하지 않는 이메일입니다.');
  } else if (errorText.includes('비밀번호가 일치하지 않습니다')) {
    showError(passwordInput, '비밀번호가 일치하지 않습니다.');
  } else if (errorText.includes('비활성화') || errorText.includes('정지') || errorText.includes('없는 계정')) {
    // 계정 상태 관련 에러는 서버 메시지만 표시
    emailInput.classList.add('error');
    passwordInput.classList.add('error');
  }
}

// ===== 페이지 가시성 처리 =====

/**
 * 페이지 가시성 변경 처리
 */
function setupVisibilityChange() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
  
    }
  });
}

// ===== 에러 처리 =====

/**
 * 전역 에러 처리
 */
function setupGlobalErrorHandling() {
  window.addEventListener('error', (e) => {
    console.error('페이지 에러 발생:', e);
  });
}

// ===== 초기화 =====

/**
 * 페이지 초기화
 */
function initialize() {
  setupRealTimeValidation();
  setupKeyboardAccessibility();
  setupVisibilityChange();
  setupGlobalErrorHandling();
  
  loginForm.addEventListener('submit', handleSubmit);
  
  // 서버 에러 메시지 처리
  handleServerError();
}

// ===== DOM 로드 완료 시 초기화 =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
