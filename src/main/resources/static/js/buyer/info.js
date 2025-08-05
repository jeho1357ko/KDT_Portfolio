
  // ===== 계정 정보 관리자 클래스 =====
  class AccountInfoManager {
    constructor() {
      this.elements = this.initializeElements();
      this.modals = this.initializeModals();
      this.nextAction = null; // 'edit' or 'delete'
      
      this.initialize();
    }

    // ===== 요소 초기화 =====
    initializeElements() {
      return {
        editBtn: document.getElementById('editBtn'),
        deleteBtn: document.getElementById('deleteBtn'),
        passwordInput: document.getElementById('passwordInput'),
        modalErrorMessage: document.getElementById('modalErrorMessage')
      };
    }

    // ===== 모달 초기화 =====
    initializeModals() {
      return {
        passwordModal: document.getElementById('passwordModal'),
        withdrawalWarningModal: document.getElementById('withdrawal-warning-modal')
      };
    }

    // ===== 초기화 =====
    initialize() {
      console.log('=== 계정 정보 페이지 초기화 ===');
      
      this.bindEvents();
      this.setupAccessibility();
      
      console.log('계정 정보 페이지 초기화 완료');
    }

    // ===== 이벤트 바인딩 =====
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

    // ===== 비밀번호 모달 이벤트 설정 =====
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

    // ===== 경고 모달 이벤트 설정 =====
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

    // ===== 모달 열기 =====
    openModal(modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      if (modal === this.modals.passwordModal) {
        this.resetPasswordModal();
      }
      
      // 포커스 관리
      this.manageModalFocus(modal);
    }

    // ===== 모달 닫기 =====
    closeModal(modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      
      // 포커스 복원
      this.restoreFocus();
    }

    // ===== 비밀번호 모달 초기화 =====
    resetPasswordModal() {
      this.elements.passwordInput.value = '';
      this.elements.modalErrorMessage.textContent = '';
      this.elements.passwordInput.focus();
    }

    // ===== 포커스 관리 =====
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

    // ===== 포커스 복원 =====
    restoreFocus() {
      // 모달을 열었던 버튼으로 포커스 복원
      if (this.nextAction === 'edit') {
        this.elements.editBtn.focus();
      } else if (this.nextAction === 'delete') {
        this.elements.deleteBtn.focus();
      }
    }

    // ===== 액션 실행 =====
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

    // ===== 비밀번호 검증 =====
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

    // ===== 비밀번호 확인 =====
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

    // ===== 액션 실행 =====
    async executeAction() {
      if (this.nextAction === 'edit') {
        this.navigateToEdit();
      } else if (this.nextAction === 'delete') {
        await this.processDeletion();
      }
    }

    // ===== 정보 수정 페이지로 이동 =====
    navigateToEdit() {
      console.log('정보 수정 페이지로 이동');
      window.location.href = '/buyer/edit';
    }

    // ===== 회원 탈퇴 처리 =====
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

    // ===== 탈퇴 폼 생성 =====
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

    // ===== 비밀번호 에러 표시 =====
    showPasswordError(message) {
      this.elements.modalErrorMessage.textContent = message;
      this.elements.passwordInput.focus();
      
      // 에러 메시지 자동 숨김
      setTimeout(() => {
        this.elements.modalErrorMessage.textContent = '';
      }, 5000);
    }

    // ===== 접근성 설정 =====
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

    // ===== 페이지 통계 수집 =====
    trackPageView() {
      console.log('계정 정보 페이지 조회');
      // Google Analytics나 다른 분석 도구 연동 가능
    }

    // ===== 에러 로깅 =====
    logError(error, context) {
      console.error(`[${context}] 오류 발생:`, error);
      // 에러 추적 서비스 연동 가능
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

  // ===== 초기화 =====
  document.addEventListener('DOMContentLoaded', () => {
    const accountInfoManager = new AccountInfoManager();
    
    // 페이지 통계 수집
    setTimeout(() => {
      accountInfoManager.trackPageView();
    }, 1000);
  });