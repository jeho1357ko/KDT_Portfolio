
  // 유효성 검사 규칙
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

  // DOM 요소들
  let form, searchPostNumberBtn;

  // 초기화 함수
  function initializeElements() {
    form = document.getElementById('signupForm');
    searchPostNumberBtn = document.getElementById('searchPostNumberBtn');
    
    if (!form || !searchPostNumberBtn) {
      console.error('필수 DOM 요소를 찾을 수 없습니다.');
      return false;
    }
    return true;
  }

  // 유효성 검사 함수들
  function validateEmail(email) {
    return validationRules.email.regex.test(email);
  }

  function validatePassword(password) {
    return validationRules.password.regex.test(password);
  }

  function validatePhone(phone) {
    return validationRules.phone.regex.test(phone);
  }

  function validateName(name) {
    return name.length >= validationRules.name.minLength && 
            name.length <= validationRules.name.maxLength;
  }

  function validateShopName(shopName) {
    return shopName.length >= validationRules.shopName.minLength && 
            shopName.length <= validationRules.shopName.maxLength;
  }

  function validateBizRegNo(bizRegNo) {
    return validationRules.bizRegNo.regex.test(bizRegNo);
  }

  function validateAddress() {
    const postNumber = document.getElementById('postNumber').value;
    const shopAddress = document.getElementById('shopAddress').value;
    const detailAddress = document.getElementById('detailAddress').value;
    return postNumber && shopAddress && detailAddress;
  }

  // 에러 메시지 표시/숨김
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.remove('hide');
      element.classList.add('show');
    }
  }

  function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.classList.remove('show');
      element.classList.add('hide');
    }
  }

  // 주소 검색
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

  // 입력 필드 포맷팅
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

  // 실시간 유효성 검사
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

    // 이메일 중복 체크
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

    // 사업자등록번호 중복 체크
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

    // 전화번호 포맷팅
    const telInput = document.getElementById('tel');
    if (telInput) {
      telInput.addEventListener('input', function() {
        formatPhoneNumber(this);
      });
    }
  }

  // 폼 전체 유효성 검사
  function validateForm() {
    let isValid = true;

    // 각 필드 검증
    const email = document.getElementById('email').value.trim();
    if (!email) {
      showError('error-email', '이메일을 입력해주세요.');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError('error-email', validationRules.email.message);
      isValid = false;
    } else {
      hideError('error-email');
    }

    const password = document.getElementById('password').value;
    if (!password) {
      showError('error-password', '비밀번호를 입력해주세요.');
      isValid = false;
    } else if (!validatePassword(password)) {
      showError('error-password', validationRules.password.message);
      isValid = false;
    } else {
      hideError('error-password');
    }

    const shopName = document.getElementById('shopName').value.trim();
    if (!shopName) {
      showError('error-shopName', '상호명을 입력해주세요.');
      isValid = false;
    } else if (!validateShopName(shopName)) {
      showError('error-shopName', validationRules.shopName.message);
      isValid = false;
    } else {
      hideError('error-shopName');
    }

    const bizRegNo = document.getElementById('bizRegNo').value;
    if (!bizRegNo) {
      showError('error-bizRegNo', '사업자등록번호를 입력해주세요.');
      isValid = false;
    } else if (!validateBizRegNo(bizRegNo)) {
      showError('error-bizRegNo', validationRules.bizRegNo.message);
      isValid = false;
    } else {
      hideError('error-bizRegNo');
    }

    const name = document.getElementById('name').value.trim();
    if (!name) {
      showError('error-name', '대표자 이름을 입력해주세요.');
      isValid = false;
    } else if (!validateName(name)) {
      showError('error-name', validationRules.name.message);
      isValid = false;
    } else {
      hideError('error-name');
    }

    const tel = document.getElementById('tel').value;
    if (!tel) {
      showError('error-tel', '전화번호를 입력해주세요.');
      isValid = false;
    } else if (!validatePhone(tel)) {
      showError('error-tel', validationRules.phone.message);
      isValid = false;
    } else {
      hideError('error-tel');
    }

    if (!validateAddress()) {
      showError('error-address', '주소를 모두 입력해주세요.');
      isValid = false;
    } else {
      hideError('error-address');
    }

    return isValid;
  }

  // 이메일 중복 체크 함수
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

  // 사업자등록번호 중복 체크 함수
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

  // 이벤트 리스너 설정
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

  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', function() {
    if (initializeElements()) {
      setupRealTimeValidation();
      setupEventListeners();
    }
  });
