/**
 * 판매자 정보 수정 JavaScript 모듈
 * 주소 검색, 폼 유효성 검사, 폼 제출 기능을 담당
 */

// ===== 상수 정의 =====
const ADDRESS_FIELDS = {
    POST_NUMBER: 'postNumber',
    BASIC_ADDRESS: 'basicAddress',
    DETAIL_ADDRESS: 'detailAddress',
    SHOP_ADDRESS: 'shopAddress'
};

// ===== 주소 관리 클래스 =====
class AddressManager {
    /**
     * 주소 관리자 생성
     */
    constructor() {
        this.initializeElements();
        this.init();
    }

    /**
     * DOM 요소 초기화
     */
    initializeElements() {
        this.postNumberInput = document.getElementById(ADDRESS_FIELDS.POST_NUMBER);
        this.basicAddressInput = document.getElementById(ADDRESS_FIELDS.BASIC_ADDRESS);
        this.detailAddressInput = document.getElementById(ADDRESS_FIELDS.DETAIL_ADDRESS);
        this.shopAddressInput = document.getElementById(ADDRESS_FIELDS.SHOP_ADDRESS);
        this.searchButton = document.getElementById('btn-postNumber');
        this.form = document.getElementById('sellerEditForm');
        this.telInput = document.querySelector('input[name="tel"]');
        
        this.validateElements();
    }

    /**
     * 필수 DOM 요소 존재 여부 검증
     */
    validateElements() {
        const requiredElements = [
            this.postNumberInput,
            this.basicAddressInput,
            this.detailAddressInput,
            this.shopAddressInput,
            this.searchButton,
            this.form,
            this.telInput
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
        this.initializeAddressFields();
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        this.bindAddressSearchEvent();
        this.bindFormSubmitEvent();
        this.bindKeyboardEvents();
        this.bindPhoneFormatEvents();
    }

    /**
     * 주소 검색 이벤트 바인딩
     */
    bindAddressSearchEvent() {
        this.searchButton.addEventListener('click', () => this.openAddressSearch());
    }

    /**
     * 폼 제출 이벤트 바인딩
     */
    bindFormSubmitEvent() {
        this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
    }

    /**
     * 키보드 이벤트 바인딩
     */
    bindKeyboardEvents() {
        this.detailAddressInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.form.requestSubmit();
            }
        });
    }

    /**
     * 전화번호 입력 자동 하이픈 처리 이벤트 바인딩
     */
    bindPhoneFormatEvents() {
        if (!this.telInput) return;
        const handler = () => {
            const formatted = this.formatPhoneNumber(this.telInput.value);
            this.telInput.value = formatted;
        };
        this.telInput.addEventListener('input', handler);
        this.telInput.addEventListener('blur', handler);
        this.telInput.addEventListener('paste', (e) => {
            setTimeout(handler, 0);
        });
    }

    /**
     * 전화번호 형식으로 하이픈 자동 삽입 (국번 02 예외 처리 포함)
     * @param {string} value - 원본 입력 값
     * @returns {string} 포맷된 값
     */
    formatPhoneNumber(value) {
        let digits = (value || '').replace(/\D/g, '').slice(0, 11);
        if (digits.startsWith('02')) {
            if (digits.length <= 2) return digits;
            if (digits.length <= 5) return digits.replace(/(\d{2})(\d{1,3})/, '$1-$2');
            if (digits.length <= 9) return digits.replace(/(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3');
            return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        } else {
            if (digits.length <= 3) return digits;
            if (digits.length <= 7) return digits.replace(/(\d{3})(\d{1,4})/, '$1-$2');
            return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
        }
    }

    /**
     * 주소 필드 초기화
     */
    initializeAddressFields() {
        const currentAddress = this.shopAddressInput.value;
        if (currentAddress) {
            this.parseAndSetAddress(currentAddress);
        }
    }

    /**
     * 주소 검색 팝업 열기
     */
    openAddressSearch() {
        new daum.Postcode({
            oncomplete: (data) => this.handleAddressSearchComplete(data),
            onclose: () => this.handleAddressSearchClose()
        }).open();
    }

    /**
     * 주소 검색 완료 처리
     * @param {Object} data - 주소 검색 결과 데이터
     */
    handleAddressSearchComplete(data) {
        this.postNumberInput.value = data.zonecode;
        this.basicAddressInput.value = data.roadAddress || data.jibunAddress;
        this.detailAddressInput.focus();
    }

    /**
     * 주소 검색 취소 처리
     */
    handleAddressSearchClose() {
        if (!this.postNumberInput.value) {
            this.detailAddressInput.focus();
        }
    }

    /**
     * 주소 문자열 파싱 및 필드 설정
     * @param {string} fullAddress - 전체 주소 문자열
     */
    parseAndSetAddress(fullAddress) {
        const addressParts = fullAddress.split(' ');
        if (addressParts.length >= 3) {
            this.postNumberInput.value = addressParts[0];
            this.basicAddressInput.value = addressParts.slice(1, -1).join(' ');
            this.detailAddressInput.value = addressParts[addressParts.length - 1];
        }
    }

    /**
     * 폼 제출 처리
     * @param {Event} event - 폼 제출 이벤트
     */
    handleFormSubmit(event) {
        if (!this.validateForm()) {
            event.preventDefault();
            return;
        }

        this.combineAddress();
        this.showLoading();
    }

    /**
     * 폼 유효성 검사
     * @returns {boolean} 유효성 검사 통과 여부
     */
    validateForm() {
        const requiredFields = [
            { element: this.postNumberInput, name: '우편번호' },
            { element: this.basicAddressInput, name: '주소' },
            { element: this.detailAddressInput, name: '상세주소' }
        ];

        for (const field of requiredFields) {
            if (!this.validateRequiredField(field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 필수 필드 유효성 검사
     * @param {Object} field - 검사할 필드 정보
     * @returns {boolean} 유효성 검사 통과 여부
     */
    validateRequiredField(field) {
        if (!field.element.value.trim()) {
            this.showError(`${field.name}을(를) 입력해주세요.`, field.element);
            field.element.focus();
            return false;
        }
        return true;
    }

    /**
     * 주소 필드 합치기
     */
    combineAddress() {
        const postNumber = this.postNumberInput.value.trim();
        const basicAddress = this.basicAddressInput.value.trim();
        const detailAddress = this.detailAddressInput.value.trim();

        const fullAddress = `${postNumber} ${basicAddress} ${detailAddress}`;
        this.shopAddressInput.value = fullAddress;
    }

    /**
     * 에러 메시지 표시
     * @param {string} message - 표시할 에러 메시지
     * @param {HTMLElement} element - 에러가 발생한 요소
     */
    showError(message, element = null) {
        console.error(message);
        if (element) {
            this.highlightErrorElement(element);
        }
    }

    /**
     * 에러 요소 하이라이트
     * @param {HTMLElement} element - 하이라이트할 요소
     */
    highlightErrorElement(element) {
        element.style.borderColor = 'var(--color-danger)';
        setTimeout(() => {
            element.style.borderColor = '';
        }, 3000);
    }

    /**
     * 로딩 상태 표시
     */
    showLoading() {
        const submitButton = document.getElementById('update-btn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '수정 중...';
            submitButton.classList.add('loading');
        }
    }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AddressManager();
    } catch (error) {
        console.error('AddressManager 초기화 실패:', error);
    }
});
