
  // 전역 변수
  let isSubmitting = false;

  // DOM 요소
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  const buttonText = loginButton.querySelector('.button-text');

  // 유효성 검사 함수들
  const validators = {
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return '이메일을 입력해주세요.';
      if (!emailRegex.test(value)) return '올바른 이메일 형식을 입력해주세요.';
      return null;
    },
    password: (value) => {
      if (!value) return '비밀번호를 입력해주세요.';
      if (value.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
      return null;
    }
  };

  // 에러 표시 함수
  function showError(input, message) {
    const errorElement = document.getElementById(`${input.id}-error`);
    input.classList.add('error');
    input.classList.remove('success');
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  // 성공 표시 함수
  function showSuccess(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    input.classList.remove('error');
    input.classList.add('success');
    errorElement.classList.remove('show');
  }

  // 입력 필드 유효성 검사
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

  // 실시간 유효성 검사
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

  // 폼 제출 처리
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
    isSubmitting = true;
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    buttonText.textContent = '로그인 중...';

    // 폼 제출
    setTimeout(() => {
      loginForm.submit();
    }, 500);
  }

  // 키보드 접근성
  function setupKeyboardAccessibility() {
    loginForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isSubmitting) {
        handleSubmit(e);
      }
    });
  }

  // 페이지 로드 시 초기화
  function initialize() {
    setupRealTimeValidation();
    setupKeyboardAccessibility();
    loginForm.addEventListener('submit', handleSubmit);
    
    // 서버 에러 메시지가 있으면 입력 필드에 에러 스타일 적용
    const serverError = document.querySelector('.server-error-message');
    if (serverError) {
      emailInput.classList.add('error');
      passwordInput.classList.add('error');
      
      // 에러 메시지가 있을 때 입력 필드 포커스
      setTimeout(() => {
        emailInput.focus();
      }, 100);
    }
    
    // 페이지 가시성 변경 시 처리
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('구매자 로그인 페이지가 활성화되었습니다.');
      }
    });
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // 에러 처리
  window.addEventListener('error', (e) => {
    console.error('페이지 에러 발생:', e);
  });
