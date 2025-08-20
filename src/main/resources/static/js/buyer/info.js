/**
 * 구매자 계정 정보 페이지 JavaScript 모듈
 * 계정 정보 표시, 비밀번호 확인, 회원 탈퇴 기능을 담당
 */

/**
 * 계정 정보 관리자 클래스
 * 구매자 계정 정보 페이지의 모든 기능을 관리합니다.
 */
class AccountInfoManager {
  constructor() {
    this.elements = this.initializeElements();
    this.modals = this.initializeModals();
    this.nextAction = null; // 'edit' or 'delete'
    
    this.initialize();
  }

  /**
   * DOM 요소들을 초기화합니다.
   * @returns {Object} 초기화된 DOM 요소들
   */
  initializeElements() {
    return {
      editBtn: document.getElementById('editBtn'),
      deleteBtn: document.getElementById('deleteBtn'),
      passwordInput: document.getElementById('passwordInput'),
      modalErrorMessage: document.getElementById('modalErrorMessage')
    };
  }

  /**
   * 모달 요소들을 초기화합니다.
   * @returns {Object} 초기화된 모달 요소들
   */
  initializeModals() {
    return {
      passwordModal: document.getElementById('passwordModal'),
      withdrawalWarningModal: document.getElementById('withdrawal-warning-modal')
    };
  }

  /**
   * 페이지를 초기화합니다.
   */
  initialize() {
    console.log('=== 계정 정보 페이지 초기화 ===');
    
    try {
      this.bindEvents();
      this.setupAccessibility();
      
      console.log('계정 정보 페이지 초기화 완료');
    } catch (error) {
      console.error('계정 정보 페이지 초기화 중 오류:', error);
    }
  }

  /**
   * 이벤트 리스너들을 바인딩합니다.
   */
  bindEvents() {
    // 버튼 이벤트
    this.elements.editBtn.addEventListener('click', () => {
      this.nextAction = 'edit';
      this.openModal(this.modals.passwordModal);
    });

    this.elements.deleteBtn.addEventListener('click', () => {
      this.nextAction = 'delete';
      this.openModal(this.modals.withdrawalWarningModal);
    });

    // 비밀번호 모달 이벤트
    this.setupPasswordModalEvents();
    
    // 경고 모달 이벤트
    this.setupWarningModalEvents();
  }

  /**
   * 비밀번호 모달 이벤트를 설정합니다.
   */
  setupPasswordModalEvents() {
    const { passwordModal } = this.modals;
    
    // 닫기 버튼
    passwordModal.querySelector('.close-button').addEventListener('click', () => {
      this.closeModal(passwordModal);
    });
    
    // 확인 버튼
    passwordModal.querySelector('#confirmPasswordBtn').addEventListener('click', () => {
      this.proceedWithAction();
    });
    
    // Enter 키 이벤트
    this.elements.passwordInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.proceedWithAction();
      }
    });
    
    // 배경 클릭 시 닫기
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        this.closeModal(passwordModal);
      }
    });
  }

  /**
   * 경고 모달 이벤트를 설정합니다.
   */
  setupWarningModalEvents() {
    const { withdrawalWarningModal } = this.modals;
    
    // 탈퇴하기 버튼
    withdrawalWarningModal.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      this.closeModal(withdrawalWarningModal);
      this.openModal(this.modals.passwordModal);
    });
    
    // 취소 버튼
    withdrawalWarningModal.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      this.closeModal(withdrawalWarningModal);
    });
    
    // 닫기 버튼
    withdrawalWarningModal.querySelector('.close-button').addEventListener('click', () => {
      this.closeModal(withdrawalWarningModal);
    });
    
    // 배경 클릭 시 닫기
    withdrawalWarningModal.addEventListener('click', (e) => {
      if (e.target === withdrawalWarningModal) {
        this.closeModal(withdrawalWarningModal);
      }
    });
  }

  /**
   * 모달을 엽니다.
   * @param {HTMLElement} modal - 열 모달 요소
   */
  openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    if (modal === this.modals.passwordModal) {
      this.resetPasswordModal();
    }
    
    // 포커스 관리
    this.manageModalFocus(modal);
  }

  /**
   * 모달을 닫습니다.
   * @param {HTMLElement} modal - 닫을 모달 요소
   */
  closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    // 포커스 복원
    this.restoreFocus();
  }

  /**
   * 비밀번호 모달을 초기화합니다.
   */
  resetPasswordModal() {
    this.elements.passwordInput.value = '';
    this.elements.modalErrorMessage.textContent = '';
    this.elements.passwordInput.focus();
  }

  /**
   * 모달 내 포커스를 관리합니다.
   * @param {HTMLElement} modal - 포커스를 관리할 모달
   */
  manageModalFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // 모달 내에서 포커스 순환
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
        
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
          this.closeModal(modal);
        }
      });
    }
  }

  /**
   * 포커스를 복원합니다.
   */
  restoreFocus() {
    // 모달을 열었던 버튼으로 포커스 복원
    if (this.nextAction === 'edit') {
      this.elements.editBtn.focus();
    } else if (this.nextAction === 'delete') {
      this.elements.deleteBtn.focus();
    }
  }

  /**
   * 액션을 실행합니다.
   */
  async proceedWithAction() {
    const password = this.elements.passwordInput.value.trim();
    
    if (!this.validatePassword(password)) {
      return;
    }

    try {
      const isValid = await this.verifyPassword(password);
      
      if (isValid) {
        this.closeModal(this.modals.passwordModal);
        await this.executeAction();
      } else {
        this.showPasswordError('비밀번호가 틀렸습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 중 오류:', error);
      this.showPasswordError('서버 오류가 발생했습니다.');
    }
  }

  /**
   * 비밀번호를 검증합니다.
   * @param {string} password - 검증할 비밀번호
   * @returns {boolean} 검증 결과
   */
  validatePassword(password) {
    if (!password) {
      this.showPasswordError('비밀번호를 입력해주세요.');
      return false;
    }
    
    if (password.length < 4) {
      this.showPasswordError('비밀번호는 최소 4자 이상이어야 합니다.');
      return false;
    }
    
    return true;
  }

  /**
   * 서버에 비밀번호를 확인합니다.
   * @param {string} password - 확인할 비밀번호
   * @returns {Promise<boolean>} 확인 결과
   */
  async verifyPassword(password) {
    try {
      const response = await fetch('/buyer/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('비밀번호 확인 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 액션을 실행합니다.
   */
  async executeAction() {
    if (this.nextAction === 'edit') {
      this.navigateToEdit();
    } else if (this.nextAction === 'delete') {
      await this.processDeletion();
    }
  }

  /**
   * 정보 수정 페이지로 이동합니다.
   */
  navigateToEdit() {
    console.log('정보 수정 페이지로 이동');
    window.location.href = '/buyer/edit';
  }

  /**
   * 회원 탈퇴를 처리합니다.
   */
  async processDeletion() {
    console.log('회원 탈퇴 처리 시작');
    
    try {
      const form = this.createDeletionForm();
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('회원 탈퇴 처리 중 오류:', error);
      this.showPasswordError('회원 탈퇴 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 탈퇴 폼을 생성합니다.
   * @returns {HTMLFormElement} 생성된 폼 요소
   */
  createDeletionForm() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/buyer/delete';

    // CSRF 토큰 처리
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');
    
    if (csrfToken && csrfHeader) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      input.value = csrfToken;
      form.appendChild(input);
    }

    return form;
  }

  /**
   * 비밀번호 에러를 표시합니다.
   * @param {string} message - 에러 메시지
   */
  showPasswordError(message) {
    this.elements.modalErrorMessage.textContent = message;
    this.elements.passwordInput.focus();
    
    // 에러 메시지 자동 숨김
    setTimeout(() => {
      this.elements.modalErrorMessage.textContent = '';
    }, 5000);
  }

  /**
   * 접근성을 설정합니다.
   */
  setupAccessibility() {
    // 키보드 네비게이션 개선
    this.elements.editBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.elements.editBtn.click();
      }
    });

    this.elements.deleteBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.elements.deleteBtn.click();
      }
    });
  }

  /**
   * 페이지 통계를 수집합니다.
   */
  trackPageView() {
    console.log('계정 정보 페이지 조회');
    // Google Analytics나 다른 분석 도구 연동 가능
  }

  /**
   * 에러를 로깅합니다.
   * @param {Error} error - 에러 객체
   * @param {string} context - 에러 컨텍스트
   */
  logError(error, context) {
    console.error(`[${context}] 오류 발생:`, error);
    // 에러 추적 서비스 연동 가능
  }
}

/**
 * 마이페이지로 이동합니다.
 */
function goToMyPage() {
  window.location.href = '/buyer/info';
}

/**
 * 주문 내역 페이지로 이동합니다.
 */
function goToOrderHistory() {
  window.location.href = '/buyer/orders';
}

/**
 * 장바구니 페이지로 이동합니다.
 */
function goToCart() {
  window.location.href = '/buyer/cart';
}

/**
 * 페이지 초기화를 수행합니다.
 */
function initializePage() {
  const accountInfoManager = new AccountInfoManager();
  
  // 페이지 통계 수집
  setTimeout(() => {
    accountInfoManager.trackPageView();
  }, 1000);
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializePage);