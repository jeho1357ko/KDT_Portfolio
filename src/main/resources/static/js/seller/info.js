/**
 * 판매자 정보 JavaScript 모듈
 * 모달 관리, 비밀번호 확인, 회원탈퇴 기능을 담당
 */

// ===== 상수 정의 =====
const MODAL_TYPES = {
  PASSWORD: 'password',
  WITHDRAWAL_WARNING: 'withdrawal-warning'
};

const ACTIONS = {
  EDIT: 'edit',
  WITHDRAW: 'withdraw'
};

// ===== 모달 관리 클래스 =====
class ModalManager {
  /**
   * 모달 관리자 생성
   * @param {string} sellerId - 판매자 ID
   */
  constructor(sellerId) {
    this.sellerId = sellerId;
    this.currentAction = null;
    
    // DOM 요소 초기화
    this.initializeElements();
    this.bindEvents();
  }

  /**
   * DOM 요소 초기화
   */
  initializeElements() {
    this.passwordModal = document.getElementById('passwordModal');
    this.withdrawalWarningModal = document.getElementById('withdrawal-warning-modal');
    this.passwordInput = document.getElementById('passwordInput');
    this.confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    this.errorElement = document.getElementById('modalErrorMessage');
    this.withdrawForm = document.getElementById('withdraw-form');
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    this.bindButtonEvents();
    this.bindModalEvents();
    this.bindKeyboardEvents();
  }

  /**
   * 버튼 이벤트 바인딩
   */
  bindButtonEvents() {
    // 메인 버튼 이벤트
    document.getElementById('edit-btn').addEventListener('click', () => this.openPasswordModal(ACTIONS.EDIT));
    document.getElementById('withdraw-btn').addEventListener('click', () => this.openModal(MODAL_TYPES.WITHDRAWAL_WARNING));
    
    // 비밀번호 확인 버튼
    this.confirmPasswordBtn.addEventListener('click', () => this.verifyPassword());
    
    // 경고 모달 버튼들
    this.withdrawalWarningModal.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      this.closeModal(MODAL_TYPES.WITHDRAWAL_WARNING);
      this.openPasswordModal(ACTIONS.WITHDRAW);
    });

    this.withdrawalWarningModal.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      this.closeModal(MODAL_TYPES.WITHDRAWAL_WARNING);
    });
  }

  /**
   * 모달 이벤트 바인딩
   */
  bindModalEvents() {
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

  /**
   * 키보드 이벤트 바인딩
   */
  bindKeyboardEvents() {
    this.passwordInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.verifyPassword();
      }
    });
  }

  /**
   * 모달 열기
   * @param {string} modalType - 모달 타입
   */
  openModal(modalType) {
    const modal = this.getModalByType(modalType);
    modal.style.display = 'flex';
    
    if (modalType === MODAL_TYPES.PASSWORD) {
      this.resetPasswordModal();
    }
  }

  /**
   * 비밀번호 모달 열기
   * @param {string} action - 수행할 액션
   */
  openPasswordModal(action) {
    this.currentAction = action;
    this.openModal(MODAL_TYPES.PASSWORD);
  }

  /**
   * 모달 닫기
   * @param {string} modalType - 모달 타입
   */
  closeModal(modalType) {
    const modal = this.getModalByType(modalType);
    modal.style.display = 'none';
  }

  /**
   * 모든 모달 닫기
   */
  closeAllModals() {
    this.passwordModal.style.display = 'none';
    this.withdrawalWarningModal.style.display = 'none';
  }

  /**
   * 타입별 모달 요소 가져오기
   * @param {string} modalType - 모달 타입
   * @returns {HTMLElement} 모달 요소
   */
  getModalByType(modalType) {
    return modalType === MODAL_TYPES.PASSWORD ? this.passwordModal : this.withdrawalWarningModal;
  }

  /**
   * 비밀번호 모달 초기화
   */
  resetPasswordModal() {
    this.passwordInput.value = '';
    this.errorElement.textContent = '';
    this.passwordInput.focus();
  }

  /**
   * 비밀번호 확인
   */
  async verifyPassword() {
    const password = this.passwordInput.value.trim();

    if (!password) {
      this.showError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await this.sendPasswordVerificationRequest(password);
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

  /**
   * 비밀번호 확인 요청 전송
   * @param {string} password - 확인할 비밀번호
   * @returns {Promise<Response>} 응답 객체
   */
  async sendPasswordVerificationRequest(password) {
    return await fetch('/seller/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password })
    });
  }

  /**
   * 에러 메시지 표시
   * @param {string} message - 표시할 에러 메시지
   */
  showError(message) {
    this.errorElement.textContent = message;
  }

  /**
   * 성공적인 인증 후 처리
   */
  handleSuccessfulVerification() {
    if (this.currentAction === ACTIONS.EDIT) {
      this.redirectToEditPage();
    } else if (this.currentAction === ACTIONS.WITHDRAW) {
      this.submitWithdrawalForm();
    }
  }

  /**
   * 수정 페이지로 리다이렉트
   */
  redirectToEditPage() {
    window.location.href = `/seller/myPage/${this.sellerId}/edit`;
  }

  /**
   * 탈퇴 폼 제출
   */
  submitWithdrawalForm() {
    this.withdrawForm.submit();
  }
}

// ===== 초기화 =====
let modalManager;

/**
 * 모달 관리자 초기화
 * @param {string} sellerId - 판매자 ID
 */
function initializeModalManager(sellerId) {
  modalManager = new ModalManager(sellerId);
}

/**
 * 페이지 초기화
 */
function initializePage() {
  const sellerIdElement = document.querySelector('[data-seller-id]');
  if (sellerIdElement) {
    const sellerId = sellerIdElement.dataset.sellerId;
    initializeModalManager(sellerId);
  } else {
    console.error('판매자 ID를 찾을 수 없습니다.');
  }
}

// ===== DOM 로드 완료 시 초기화 =====
document.addEventListener('DOMContentLoaded', initializePage);
