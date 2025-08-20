/**
 * 구매자 회원가입 페이지 JavaScript 모듈
 * 회원가입 폼 검증, 실시간 유효성 검사, 주소 검색 기능을 담당
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
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
    message: '비밀번호는 8~20자의 영문, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.'
  },
  phone: {
    regex: /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/,
    message: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
  },
  name: {
    min: 2,
    max: 10,
    message: '이름은 2~10자로 입력해주세요.'
  },
  nickname: {
    min: 2,
    max: 15,
    message: '닉네임은 2~15자로 입력해주세요.'
  }
};

/**
 * 구매자 회원가입 관리자 클래스
 * 회원가입 페이지의 모든 기능을 관리합니다.
 */
class BuyerSignupManager {
  constructor() {
    this.elements = this.initializeElements();
    this.emailCheckTimeout = null;
    
    this.initialize();
  }

  /**
   * DOM 요소들을 초기화합니다.
   * @returns {Object} 초기화된 DOM 요소들
   */
  initializeElements() {
    return {
      form: document.getElementById('signupForm'),
      emailInput: document.getElementById('email'),
      passwordInput: document.getElementById('password'),
      nameInput: document.getElementById('name'),
      nicknameInput: document.getElementById('nickname'),
      telInput: document.getElementById('tel'),
      genderSelect: document.getElementById('gender'),
      birthYearSelect: document.getElementById('birthYear'),
      birthMonthSelect: document.getElementById('birthMonth'),
      birthDaySelect: document.getElementById('birthDay'),
      birthHidden: document.getElementById('birth'),
      postNumberInput: document.getElementById('postNumber'),
      shopAddressInput: document.getElementById('shopAddress'),
      detailAddressInput: document.getElementById('detailAddress'),
      fullAddressInput: document.getElementById('fullAddress'),
      searchPostcodeBtn: document.getElementById('searchPostcodeBtn'),
      signupBtn: document.querySelector('.signup-btn')
    };
  }

  /**
   * 페이지를 초기화합니다.
   */
  initialize() {
    console.log('=== 구매자 회원가입 페이지 초기화 ===');
    
    try {
      // 생년월일 선택기 초기화
      this.populateBirthSelectors();
      
      // 실시간 유효성 검사 설정
      this.setupRealTimeValidation();
      
      // 이벤트 리스너 설정
      this.setupEventListeners();
      
      console.log('구매자 회원가입 페이지 초기화 완료');
    } catch (error) {
      console.error('구매자 회원가입 페이지 초기화 중 오류:', error);
    }
  }

  /**
   * 이메일 유효성을 검사합니다.
   * @param {string} email - 검사할 이메일
   * @returns {boolean} 유효성 여부
   */
  validateEmail(email) {
    return VALIDATION_RULES.email.regex.test(email);
  }

  /**
   * 비밀번호 유효성을 검사합니다.
   * @param {string} password - 검사할 비밀번호
   * @returns {boolean} 유효성 여부
   */
  validatePassword(password) {
    return VALIDATION_RULES.password.regex.test(password);
  }

  /**
   * 전화번호 유효성을 검사합니다.
   * @param {string} phone - 검사할 전화번호
   * @returns {boolean} 유효성 여부
   */
  validatePhone(phone) {
    return VALIDATION_RULES.phone.regex.test(phone);
  }

  /**
   * 이름 유효성을 검사합니다.
   * @param {string} name - 검사할 이름
   * @returns {boolean} 유효성 여부
   */
  validateName(name) {
    return name.length >= VALIDATION_RULES.name.min && name.length <= VALIDATION_RULES.name.max;
  }

  /**
   * 닉네임 유효성을 검사합니다.
   * @param {string} nickname - 검사할 닉네임
   * @returns {boolean} 유효성 여부
   */
  validateNickname(nickname) {
    return nickname.length >= VALIDATION_RULES.nickname.min && nickname.length <= VALIDATION_RULES.nickname.max;
  }

  /**
   * 생년월일 유효성을 검사합니다.
   * @param {string} birth - 검사할 생년월일
   * @returns {boolean} 유효성 여부
   */
  validateBirth(birth) {
    if (!birth) return false;
    
    const today = new Date();
    const birthDate = new Date(birth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age >= 0 && age <= 100;
  }

  /**
   * 주소 유효성을 검사합니다.
   * @returns {boolean} 유효성 여부
   */
  validateAddress() {
    const postNumber = this.elements.postNumberInput.value;
    const shopAddress = this.elements.shopAddressInput.value;
    const detailAddress = this.elements.detailAddressInput.value;
    return postNumber && shopAddress && detailAddress;
  }

  /**
   * 에러 메시지를 표시합니다.
   * @param {string} elementId - 에러 메시지를 표시할 요소 ID
   * @param {string} message - 표시할 메시지
   */
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.remove('hide');
      element.classList.add('show');
    }
  }

  /**
   * 에러 메시지를 숨깁니다.
   * @param {string} elementId - 에러 메시지를 숨길 요소 ID
   */
  hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.classList.remove('show');
      element.classList.add('hide');
    }
  }

  /**
   * 생년월일을 업데이트합니다.
   */
  updateBirthDate() {
    const year = this.elements.birthYearSelect.value;
    const month = this.elements.birthMonthSelect.value;
    const day = this.elements.birthDaySelect.value;
    
    if (year && month && day) {
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      this.elements.birthHidden.value = birthDate;
    } else {
      this.elements.birthHidden.value = '';
    }
  }

  /**
   * 생년월일 선택기를 초기화합니다.
   */
  populateBirthSelectors() {
    // 년도 옵션 (현재 년도부터 100년 전까지)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 100; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year + '년';
      this.elements.birthYearSelect.appendChild(option);
    }
    
    // 월 옵션
    for (let month = 1; month <= 12; month++) {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month + '월';
      this.elements.birthMonthSelect.appendChild(option);
    }
    
    // 일 옵션 (기본 31일)
    for (let day = 1; day <= 31; day++) {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = day + '일';
      this.elements.birthDaySelect.appendChild(option);
    }
  }

  /**
   * 일 옵션을 업데이트합니다.
   */
  updateDays() {
    const year = parseInt(this.elements.birthYearSelect.value);
    const month = parseInt(this.elements.birthMonthSelect.value);
    
    if (year && month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // 기존 일 옵션 제거
      this.elements.birthDaySelect.innerHTML = '<option value="">일</option>';
      
      // 새로운 일 옵션 추가
      for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + '일';
        this.elements.birthDaySelect.appendChild(option);
      }
    }
  }

  /**
   * 주소를 검색합니다.
   */
  searchAddress() {
    new daum.Postcode({
      oncomplete: (data) => {
        this.elements.postNumberInput.value = data.zonecode;
        this.elements.shopAddressInput.value = data.address;
        this.elements.detailAddressInput.focus();
        this.updateFullAddress();
        this.hideError('error-address');
      }
    }).open();
  }

  /**
   * 전체 주소를 업데이트합니다.
   */
  updateFullAddress() {
    const addr = this.elements.shopAddressInput.value;
    const detail = this.elements.detailAddressInput.value;
    this.elements.fullAddressInput.value = addr + ' ' + detail;
  }

  /**
   * 이메일 중복을 체크합니다.
   * @param {string} email - 체크할 이메일
   */
  async checkEmailDuplicate(email) {
    try {
      const response = await fetch(`/buyer/check-email?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      
      if (result.exists) {
        this.showError('error-email', '이미 가입된 이메일입니다');
      } else {
        this.hideError('error-email');
      }
    } catch (error) {
      console.error('이메일 중복 체크 오류:', error);
    }
  }

  /**
   * 실시간 유효성 검사를 설정합니다.
   */
  setupRealTimeValidation() {
    // 이메일 실시간 검사
    if (this.elements.emailInput) {
      this.elements.emailInput.addEventListener('blur', () => {
        const email = this.elements.emailInput.value.trim();
        if (email && this.validateEmail(email)) {
          this.checkEmailDuplicate(email);
        }
      });
      
      this.elements.emailInput.addEventListener('input', () => {
        const email = this.elements.emailInput.value.trim();
        clearTimeout(this.emailCheckTimeout);
        if (email && this.validateEmail(email)) {
          this.emailCheckTimeout = setTimeout(() => {
            this.checkEmailDuplicate(email);
          }, 500);
        } else {
          this.hideError('error-email');
        }
      });
    }

    // 비밀번호 실시간 검사
    if (this.elements.passwordInput) {
      this.elements.passwordInput.addEventListener('blur', () => {
        const password = this.elements.passwordInput.value;
        if (password && !this.validatePassword(password)) {
          this.showError('error-password', VALIDATION_RULES.password.message);
        } else {
          this.hideError('error-password');
        }
      });
    }

    // 이름 실시간 검사
    if (this.elements.nameInput) {
      this.elements.nameInput.addEventListener('blur', () => {
        const name = this.elements.nameInput.value;
        if (name && !this.validateName(name)) {
          this.showError('error-name', VALIDATION_RULES.name.message);
        } else {
          this.hideError('error-name');
        }
      });
    }

    // 닉네임 실시간 검사
    if (this.elements.nicknameInput) {
      this.elements.nicknameInput.addEventListener('blur', () => {
        const nickname = this.elements.nicknameInput.value;
        if (nickname && !this.validateNickname(nickname)) {
          this.showError('error-nickname', VALIDATION_RULES.nickname.message);
        } else {
          this.hideError('error-nickname');
        }
      });
    }

    // 전화번호 실시간 검사 및 포맷팅
    if (this.elements.telInput) {
      this.elements.telInput.addEventListener('blur', () => {
        const tel = this.elements.telInput.value;
        if (tel && !this.validatePhone(tel)) {
          this.showError('error-tel', VALIDATION_RULES.phone.message);
        } else {
          this.hideError('error-tel');
        }
      });
      
      this.elements.telInput.addEventListener('input', () => {
        let value = this.elements.telInput.value.replace(/[^0-9]/g, '');
        
        if (value.length > 11) {
          value = value.substring(0, 11);
        }
        
        if (value.length >= 3 && value.length <= 7) {
          value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        } else if (value.length >= 8) {
          value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        this.elements.telInput.value = value;
      });
    }

    // 생년월일 선택 이벤트
    if (this.elements.birthYearSelect) {
      this.elements.birthYearSelect.addEventListener('change', () => {
        this.updateDays();
        this.updateBirthDate();
      });
    }
    
    if (this.elements.birthMonthSelect) {
      this.elements.birthMonthSelect.addEventListener('change', () => {
        this.updateDays();
        this.updateBirthDate();
      });
    }
    
    if (this.elements.birthDaySelect) {
      this.elements.birthDaySelect.addEventListener('change', () => {
        this.updateBirthDate();
      });
    }

    // 주소 검색 버튼
    if (this.elements.searchPostcodeBtn) {
      this.elements.searchPostcodeBtn.addEventListener('click', () => {
        this.searchAddress();
      });
    }

    // 상세주소 입력 시 전체 주소 업데이트
    if (this.elements.detailAddressInput) {
      this.elements.detailAddressInput.addEventListener('input', () => {
        this.updateFullAddress();
      });
    }
  }

  /**
   * 폼 유효성을 검사합니다.
   * @returns {boolean} 유효성 여부
   */
  validateForm() {
    let isValid = true;

    // 이메일 검증
    const email = this.elements.emailInput.value;
    if (!email) {
      this.showError('error-email', '이메일을 입력해주세요.');
      isValid = false;
    } else if (!this.validateEmail(email)) {
      this.showError('error-email', VALIDATION_RULES.email.message);
      isValid = false;
    } else {
      this.hideError('error-email');
    }

    // 비밀번호 검증
    const password = this.elements.passwordInput.value;
    if (!password) {
      this.showError('error-password', '비밀번호를 입력해주세요.');
      isValid = false;
    } else if (!this.validatePassword(password)) {
      this.showError('error-password', VALIDATION_RULES.password.message);
      isValid = false;
    } else {
      this.hideError('error-password');
    }

    // 이름 검증
    const name = this.elements.nameInput.value;
    if (!name) {
      this.showError('error-name', '이름을 입력해주세요.');
      isValid = false;
    } else if (!this.validateName(name)) {
      this.showError('error-name', VALIDATION_RULES.name.message);
      isValid = false;
    } else {
      this.hideError('error-name');
    }

    // 닉네임 검증
    const nickname = this.elements.nicknameInput.value;
    if (!nickname) {
      this.showError('error-nickname', '닉네임을 입력해주세요.');
      isValid = false;
    } else if (!this.validateNickname(nickname)) {
      this.showError('error-nickname', VALIDATION_RULES.nickname.message);
      isValid = false;
    } else {
      this.hideError('error-nickname');
    }

    // 전화번호 검증
    const tel = this.elements.telInput.value;
    if (!tel) {
      this.showError('error-tel', '전화번호를 입력해주세요.');
      isValid = false;
    } else if (!this.validatePhone(tel)) {
      this.showError('error-tel', VALIDATION_RULES.phone.message);
      isValid = false;
    } else {
      this.hideError('error-tel');
    }

    // 성별 검증
    const gender = this.elements.genderSelect.value;
    if (!gender) {
      this.showError('error-gender', '성별을 선택해주세요.');
      isValid = false;
    } else {
      this.hideError('error-gender');
    }

    // 생년월일 검증
    const birth = this.elements.birthHidden.value;
    if (!birth) {
      this.showError('error-birth', '생년월일을 입력해주세요.');
      isValid = false;
    } else if (!this.validateBirth(birth)) {
      this.showError('error-birth', '올바른 생년월일을 입력해주세요.');
      isValid = false;
    } else {
      this.hideError('error-birth');
    }

    // 주소 검증
    if (!this.validateAddress()) {
      this.showError('error-address', '주소를 모두 입력해주세요.');
      isValid = false;
    } else {
      this.hideError('error-address');
    }

    return isValid;
  }

  /**
   * 이벤트 리스너를 설정합니다.
   */
  setupEventListeners() {
    // 폼 제출 시 유효성 검사
    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => {
        if (!this.validateForm()) {
          e.preventDefault();
          alert('입력 정보를 확인해주세요.');
          return false;
        }
      });
    }
  }
}

/**
 * 페이지 로드 시 BuyerSignupManager를 초기화합니다.
 */
document.addEventListener("DOMContentLoaded", () => {
  const buyerSignupManager = new BuyerSignupManager();
});
  