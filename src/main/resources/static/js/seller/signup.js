/**
 * 판매자 회원가입 JavaScript 모듈
 * 폼 유효성 검사, 중복 체크, 주소 검색 기능을 담당
 */

// ===== 유효성 검사 규칙 =====
const validationRules = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 형식을 입력해주세요.'
  },
  password: {
    regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    message: '비밀번호는 8~20자의 영문, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다.'
  },
  phone: {
    regex: /^01[0-9]-[0-9]{4}-[0-9]{4}$/,
    message: '올바른 전화번호 형식을 입력해주세요. (예: 010-0000-0000)'
  },
  name: {
    minLength: 2,
    maxLength: 10,
    message: '대표자 이름은 2~10자로 입력해주세요.'
  },
  shopName: {
    minLength: 2,
    maxLength: 50,
    message: '상호명은 2~50자로 입력해주세요.'
  },
  bizRegNo: {
    regex: /^\d{3}-\d{2}-\d{5}$/,
    message: '올바른 사업자등록번호 형식을 입력해주세요. (예: 000-00-00000)'
  }
};

// ===== 전역 변수 =====
let form, searchPostNumberBtn;

// ===== 초기화 함수 =====

/**
 * DOM 요소 초기화
 * @returns {boolean} 초기화 성공 여부
 */
function initializeElements() {
  form = document.getElementById('signupForm');
  searchPostNumberBtn = document.getElementById('searchPostNumberBtn');
  
  if (!form || !searchPostNumberBtn) {
    console.error('필수 DOM 요소를 찾을 수 없습니다.');
    return false;
  }
  return true;
}

// ===== 유효성 검사 함수들 =====

/**
 * 이메일 유효성 검사
 * @param {string} email - 검사할 이메일
 * @returns {boolean} 유효성 여부
 */
function validateEmail(email) {
  return validationRules.email.regex.test(email);
}

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 유효성 여부
 */
function validatePassword(password) {
  return validationRules.password.regex.test(password);
}

/**
 * 전화번호 유효성 검사
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 유효성 여부
 */
function validatePhone(phone) {
  return validationRules.phone.regex.test(phone);
}

/**
 * 이름 유효성 검사
 * @param {string} name - 검사할 이름
 * @returns {boolean} 유효성 여부
 */
function validateName(name) {
  return name.length >= validationRules.name.minLength && 
         name.length <= validationRules.name.maxLength;
}

/**
 * 상호명 유효성 검사
 * @param {string} shopName - 검사할 상호명
 * @returns {boolean} 유효성 여부
 */
function validateShopName(shopName) {
  return shopName.length >= validationRules.shopName.minLength && 
         shopName.length <= validationRules.shopName.maxLength;
}

/**
 * 사업자등록번호 유효성 검사
 * @param {string} bizRegNo - 검사할 사업자등록번호
 * @returns {boolean} 유효성 여부
 */
function validateBizRegNo(bizRegNo) {
  return validationRules.bizRegNo.regex.test(bizRegNo);
}

/**
 * 주소 유효성 검사
 * @returns {boolean} 유효성 여부
 */
function validateAddress() {
  const postNumber = document.getElementById('postNumber').value;
  const shopAddress = document.getElementById('shopAddress').value;
  const detailAddress = document.getElementById('detailAddress').value;
  return postNumber && shopAddress && detailAddress;
}

// ===== 에러 메시지 관리 =====

/**
 * 에러 메시지 표시
 * @param {string} elementId - 에러 메시지를 표시할 요소 ID
 * @param {string} message - 표시할 메시지
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.remove('hide');
    element.classList.add('show');
  }
}

/**
 * 에러 메시지 숨기기
 * @param {string} elementId - 숨길 에러 메시지 요소 ID
 */
function hideError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = '';
    element.classList.remove('show');
    element.classList.add('hide');
  }
}

// ===== 주소 검색 =====

/**
 * 주소 검색 실행
 */
function searchAddress() {
  new daum.Postcode({
    oncomplete: function(data) {
      document.getElementById('postNumber').value = data.zonecode;
      document.getElementById('shopAddress').value = data.address;
      document.getElementById('detailAddress').focus();
      hideError('error-address');
    }
  }).open();
}

// ===== 입력 필드 포맷팅 =====

/**
 * 사업자등록번호 포맷팅
 * @param {HTMLInputElement} input - 포맷팅할 입력 필드
 */
function formatBizRegNo(input) {
  let value = input.value.replace(/[^0-9]/g, '');
  
  if (value.length > 10) {
    value = value.substring(0, 10);
  }
  
  if (value.length >= 3 && value.length <= 5) {
    value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
  } else if (value.length >= 6) {
    value = value.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
  }
  
  input.value = value;
}

/**
 * 전화번호 포맷팅
 * @param {HTMLInputElement} input - 포맷팅할 입력 필드
 */
function formatPhoneNumber(input) {
  let value = input.value.replace(/[^0-9]/g, '');
  
  if (value.length > 11) {
    value = value.substring(0, 11);
  }
  
  if (value.length >= 3 && value.length <= 7) {
    value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
  } else if (value.length >= 8) {
    value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  input.value = value;
}

// ===== 중복 체크 함수들 =====

/**
 * 이메일 중복 체크
 * @param {string} email - 체크할 이메일
 */
async function checkEmailDuplicate(email) {
  try {
    const response = await fetch(`/seller/check-email?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.exists) {
      showError('error-email', '이미 가입된 이메일입니다');
    } else {
      hideError('error-email');
    }
  } catch (error) {
    console.error('이메일 중복 체크 오류:', error);
  }
}

/**
 * 사업자등록번호 중복 체크
 * @param {string} bizRegNo - 체크할 사업자등록번호
 */
async function checkBizRegNoDuplicate(bizRegNo) {
  try {
    const response = await fetch(`/seller/check-bizRegNo?bizRegNo=${encodeURIComponent(bizRegNo)}`);
    const result = await response.json();
    
    if (result.exists) {
      showError('error-bizRegNo', '이미 가입된 사업자 번호입니다');
    } else {
      hideError('error-bizRegNo');
    }
  } catch (error) {
    console.error('사업자등록번호 중복 체크 오류:', error);
  }
}

// ===== 실시간 유효성 검사 설정 =====

/**
 * 실시간 유효성 검사 설정
 */
function setupRealTimeValidation() {
  const fields = [
    { id: 'email', validator: validateEmail, rule: validationRules.email },
    { id: 'password', validator: validatePassword, rule: validationRules.password },
    { id: 'shopName', validator: validateShopName, rule: validationRules.shopName },
    { id: 'bizRegNo', validator: validateBizRegNo, rule: validationRules.bizRegNo },
    { id: 'name', validator: validateName, rule: validationRules.name },
    { id: 'tel', validator: validatePhone, rule: validationRules.phone }
  ];

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    if (input) {
      // blur 이벤트
      input.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !field.validator(value)) {
          showError(`error-${field.id}`, field.rule.message);
        } else {
          hideError(`error-${field.id}`);
        }
      });

      // input 이벤트 (실시간 검사)
      input.addEventListener('input', function() {
        const value = this.value.trim();
        if (value && !field.validator(value)) {
          showError(`error-${field.id}`, field.rule.message);
        } else {
          hideError(`error-${field.id}`);
        }
      });
    }
  });

  setupEmailDuplicateCheck();
  setupBizRegNoDuplicateCheck();
  setupPhoneNumberFormatting();
}

/**
 * 이메일 중복 체크 설정
 */
function setupEmailDuplicateCheck() {
  const emailInput = document.getElementById('email');
  if (emailInput) {
    let emailTimeout;
    
    emailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      if (email && validateEmail(email)) {
        checkEmailDuplicate(email);
      }
    });
    
    emailInput.addEventListener('input', function() {
      const email = this.value.trim();
      clearTimeout(emailTimeout);
      if (email && validateEmail(email)) {
        emailTimeout = setTimeout(() => {
          checkEmailDuplicate(email);
        }, 500); // 0.5초 딜레이
      } else {
        hideError('error-email');
      }
    });
  }
}

/**
 * 사업자등록번호 중복 체크 설정
 */
function setupBizRegNoDuplicateCheck() {
  const bizRegNoInput = document.getElementById('bizRegNo');
  if (bizRegNoInput) {
    let bizRegNoTimeout;
    
    bizRegNoInput.addEventListener('blur', function() {
      const bizRegNo = this.value.trim();
      if (bizRegNo && validateBizRegNo(bizRegNo)) {
        checkBizRegNoDuplicate(bizRegNo);
      }
    });
    
    bizRegNoInput.addEventListener('input', function() {
      formatBizRegNo(this);
      const bizRegNo = this.value.trim();
      clearTimeout(bizRegNoTimeout);
      if (bizRegNo && validateBizRegNo(bizRegNo)) {
        bizRegNoTimeout = setTimeout(() => {
          checkBizRegNoDuplicate(bizRegNo);
        }, 500); // 0.5초 딜레이
      } else {
        hideError('error-bizRegNo');
      }
    });
  }
}

/**
 * 전화번호 포맷팅 설정
 */
function setupPhoneNumberFormatting() {
  const telInput = document.getElementById('tel');
  if (telInput) {
    telInput.addEventListener('input', function() {
      formatPhoneNumber(this);
    });
  }
}

// ===== 폼 전체 유효성 검사 =====

/**
 * 폼 전체 유효성 검사
 * @returns {boolean} 유효성 여부
 */
function validateForm() {
  let isValid = true;

  // 각 필드 검증
  const validations = [
    { field: 'email', value: document.getElementById('email').value.trim(), validator: validateEmail, rule: validationRules.email },
    { field: 'password', value: document.getElementById('password').value, validator: validatePassword, rule: validationRules.password },
    { field: 'shopName', value: document.getElementById('shopName').value.trim(), validator: validateShopName, rule: validationRules.shopName },
    { field: 'bizRegNo', value: document.getElementById('bizRegNo').value, validator: validateBizRegNo, rule: validationRules.bizRegNo },
    { field: 'name', value: document.getElementById('name').value.trim(), validator: validateName, rule: validationRules.name },
    { field: 'tel', value: document.getElementById('tel').value, validator: validatePhone, rule: validationRules.phone }
  ];

  validations.forEach(validation => {
    if (!validation.value) {
      showError(`error-${validation.field}`, `${getFieldLabel(validation.field)}을(를) 입력해주세요.`);
      isValid = false;
    } else if (!validation.validator(validation.value)) {
      showError(`error-${validation.field}`, validation.rule.message);
      isValid = false;
    } else {
      hideError(`error-${validation.field}`);
    }
  });

  // 주소 검증
  if (!validateAddress()) {
    showError('error-address', '주소를 모두 입력해주세요.');
    isValid = false;
  } else {
    hideError('error-address');
  }

  return isValid;
}

/**
 * 필드 라벨 가져오기
 * @param {string} field - 필드명
 * @returns {string} 필드 라벨
 */
function getFieldLabel(field) {
  const labels = {
    email: '이메일',
    password: '비밀번호',
    shopName: '상호명',
    bizRegNo: '사업자등록번호',
    name: '대표자 이름',
    tel: '전화번호'
  };
  return labels[field] || field;
}

// ===== 이벤트 리스너 설정 =====

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 주소 검색 버튼
  searchPostNumberBtn.addEventListener('click', searchAddress);

  // 폼 제출
  form.addEventListener('submit', function(e) {
    if (!validateForm()) {
      e.preventDefault();
      alert('입력 정보를 확인해주세요.');
      return false;
    }
  });
}

// ===== 페이지 초기화 =====

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  if (initializeElements()) {
    setupRealTimeValidation();
    setupEventListeners();
  }
});
