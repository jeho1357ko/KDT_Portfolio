// ===== 상수 정의 =====
const MODAL_TYPES = {
  PASSWORD: 'password',
  WITHDRAWAL_WARNING: 'withdrawal-warning'
};

const ACTIONS = {
  EDIT: 'edit',
  WITHDRAW: 'withdraw'
};

// ===== 클래스 정의 =====
class ModalManager {
  constructor(sellerId) {
    this.passwordModal = document.getElementById('passwordModal');
    this.withdrawalWarningModal = document.getElementById('withdrawal-warning-modal');
    this.passwordInput = document.getElementById('passwordInput');
    this.confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    this.errorElement = document.getElementById('modalErrorMessage');
    this.withdrawForm = document.getElementById('withdraw-form');
    
    this.sellerId = sellerId;
    this.currentAction = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 버튼 이벤트
    document.getElementById('edit-btn').addEventListener('click', () => this.openPasswordModal(ACTIONS.EDIT));
    document.getElementById('withdraw-btn').addEventListener('click', () => this.openModal(MODAL_TYPES.WITHDRAWAL_WARNING));
    
    // 비밀번호 확인
    this.confirmPasswordBtn.addEventListener('click', () => this.verifyPassword());
    this.passwordInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.verifyPassword();
      }
    });

    // 경고 모달 버튼들
    this.withdrawalWarningModal.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      this.closeModal(MODAL_TYPES.WITHDRAWAL_WARNING);
      this.openPasswordModal(ACTIONS.WITHDRAW);
    });

    this.withdrawalWarningModal.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      this.closeModal(MODAL_TYPES.WITHDRAWAL_WARNING);
    });

    // 모달 배경 클릭 시 닫기
    window.addEventListener('click', (event) => {
      if (event.target === this.passwordModal) {
        this.closeModal(MODAL_TYPES.PASSWORD);
      }
      if (event.target === this.withdrawalWarningModal) {
        this.closeModal(MODAL_TYPES.WITHDRAWAL_WARNING);
      }
    });
  }

  openModal(modalType) {
    const modal = modalType === MODAL_TYPES.PASSWORD ? this.passwordModal : this.withdrawalWarningModal;
    modal.style.display = 'flex';
    
    if (modalType === MODAL_TYPES.PASSWORD) {
      this.resetPasswordModal();
    }
  }

  openPasswordModal(action) {
    this.currentAction = action;
    this.openModal(MODAL_TYPES.PASSWORD);
  }

  closeModal(modalType) {
    const modal = modalType === MODAL_TYPES.PASSWORD ? this.passwordModal : this.withdrawalWarningModal;
    modal.style.display = 'none';
  }

  closeAllModals() {
    this.passwordModal.style.display = 'none';
    this.withdrawalWarningModal.style.display = 'none';
  }

  resetPasswordModal() {
    this.passwordInput.value = '';
    this.errorElement.textContent = '';
    this.passwordInput.focus();
  }

  async verifyPassword() {
    const password = this.passwordInput.value.trim();

    if (!password) {
      this.showError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/seller/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      });

      const data = await response.json();

      if (data.success) {
        this.closeModal(MODAL_TYPES.PASSWORD);
        this.handleSuccessfulVerification();
      } else {
        this.showError('비밀번호가 일치하지 않습니다.');
        this.passwordInput.focus();
      }
    } catch (error) {
      console.error('Error:', error);
      this.showError('서버 오류가 발생했습니다.');
    }
  }

  showError(message) {
    this.errorElement.textContent = message;
  }

  handleSuccessfulVerification() {
    if (this.currentAction === ACTIONS.EDIT) {
      window.location.href = `/seller/myPage/${this.sellerId}/edit`;
    } else if (this.currentAction === ACTIONS.WITHDRAW) {
      this.withdrawForm.submit();
    }
  }
}

// ===== 초기화 =====
let modalManager;

function initializeModalManager(sellerId) {
  modalManager = new ModalManager(sellerId);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // sellerId는 Thymeleaf에서 전달받아야 함
  const sellerIdElement = document.querySelector('[data-seller-id]');
  if (sellerIdElement) {
    const sellerId = sellerIdElement.dataset.sellerId;
    initializeModalManager(sellerId);
  }
});
