
    // 유효성 검사 규칙
    const validationRules = {
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

    // DOM 요소 초기화
    function initializeElements() {
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
      return name.length >= validationRules.name.min && name.length <= validationRules.name.max;
    }

    function validateNickname(nickname) {
      return nickname.length >= validationRules.nickname.min && nickname.length <= validationRules.nickname.max;
    }

    function validateBirth(birth) {
      if (!birth) return false;
      const today = new Date();
      const birthDate = new Date(birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      return age >= 14 && age <= 100;
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

    // 생년월일 관련 함수들
    function updateBirthDate() {
      const year = document.getElementById('birthYear').value;
      const month = document.getElementById('birthMonth').value;
      const day = document.getElementById('birthDay').value;
      
      if (year && month && day) {
        const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        document.getElementById('birth').value = birthDate;
      } else {
        document.getElementById('birth').value = '';
      }
    }

    function populateBirthSelectors() {
      const yearSelect = document.getElementById('birthYear');
      const monthSelect = document.getElementById('birthMonth');
      const daySelect = document.getElementById('birthDay');
      
      // 년도 옵션 (현재 년도부터 100년 전까지)
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= currentYear - 100; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '년';
        yearSelect.appendChild(option);
      }
      
      // 월 옵션
      for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '월';
        monthSelect.appendChild(option);
      }
      
      // 일 옵션 (기본 31일)
      for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + '일';
        daySelect.appendChild(option);
      }
    }

    function updateDays() {
      const year = parseInt(document.getElementById('birthYear').value);
      const month = parseInt(document.getElementById('birthMonth').value);
      const daySelect = document.getElementById('birthDay');
      
      if (year && month) {
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // 기존 일 옵션 제거
        daySelect.innerHTML = '<option value="">일</option>';
        
        // 새로운 일 옵션 추가
        for (let day = 1; day <= daysInMonth; day++) {
          const option = document.createElement('option');
          option.value = day;
          option.textContent = day + '일';
          daySelect.appendChild(option);
        }
      }
    }

    // 주소 관련 함수들
    function searchAddress() {
      new daum.Postcode({
        oncomplete: function(data) {
          document.getElementById('postNumber').value = data.zonecode;
          document.getElementById('shopAddress').value = data.address;
          document.getElementById('detailAddress').focus();
          updateFullAddress();
          hideError('error-address');
        }
      }).open();
    }

    function updateFullAddress() {
      const addr = document.getElementById('shopAddress').value;
      const detail = document.getElementById('detailAddress').value;
      document.getElementById('fullAddress').value = addr + ' ' + detail;
    }

    // 이메일 중복 체크 함수
    async function checkEmailDuplicate(email) {
      try {
        const response = await fetch(`/buyer/check-email?email=${encodeURIComponent(email)}`);
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

    // 실시간 유효성 검사 설정
    function setupRealTimeValidation() {
      const elements = initializeElements();

      // 이메일 실시간 검사
      if (elements.emailInput) {
        let emailTimeout;
        elements.emailInput.addEventListener('blur', function() {
          const email = this.value.trim();
          if (email && validateEmail(email)) {
            checkEmailDuplicate(email);
          }
        });
        
        elements.emailInput.addEventListener('input', function() {
          const email = this.value.trim();
          clearTimeout(emailTimeout);
          if (email && validateEmail(email)) {
            emailTimeout = setTimeout(() => {
              checkEmailDuplicate(email);
            }, 500);
          } else {
            hideError('error-email');
          }
        });
      }

      // 비밀번호 실시간 검사
      if (elements.passwordInput) {
        elements.passwordInput.addEventListener('blur', function() {
          const password = this.value;
          if (password && !validatePassword(password)) {
            showError('error-password', validationRules.password.message);
          } else {
            hideError('error-password');
          }
        });
      }

      // 이름 실시간 검사
      if (elements.nameInput) {
        elements.nameInput.addEventListener('blur', function() {
          const name = this.value;
          if (name && !validateName(name)) {
            showError('error-name', validationRules.name.message);
          } else {
            hideError('error-name');
          }
        });
      }

      // 닉네임 실시간 검사
      if (elements.nicknameInput) {
        elements.nicknameInput.addEventListener('blur', function() {
          const nickname = this.value;
          if (nickname && !validateNickname(nickname)) {
            showError('error-nickname', validationRules.nickname.message);
          } else {
            hideError('error-nickname');
          }
        });
      }

      // 전화번호 실시간 검사 및 포맷팅
      if (elements.telInput) {
        elements.telInput.addEventListener('blur', function() {
          const tel = this.value;
          if (tel && !validatePhone(tel)) {
            showError('error-tel', validationRules.phone.message);
          } else {
            hideError('error-tel');
          }
        });
        
        elements.telInput.addEventListener('input', function() {
          let value = this.value.replace(/[^0-9]/g, '');
          
          if (value.length > 11) {
            value = value.substring(0, 11);
          }
          
          if (value.length >= 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
          } else if (value.length >= 8) {
            value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
          }
          this.value = value;
        });
      }

      // 생년월일 선택 이벤트
      if (elements.birthYearSelect) {
        elements.birthYearSelect.addEventListener('change', function() {
          updateDays();
          updateBirthDate();
        });
      }
      
      if (elements.birthMonthSelect) {
        elements.birthMonthSelect.addEventListener('change', function() {
          updateDays();
          updateBirthDate();
        });
      }
      
      if (elements.birthDaySelect) {
        elements.birthDaySelect.addEventListener('change', updateBirthDate);
      }

      // 주소 검색 버튼
      if (elements.searchPostcodeBtn) {
        elements.searchPostcodeBtn.addEventListener('click', searchAddress);
      }

      // 상세주소 입력 시 전체 주소 업데이트
      if (elements.detailAddressInput) {
        elements.detailAddressInput.addEventListener('input', updateFullAddress);
      }
    }

    // 폼 유효성 검사
    function validateForm() {
      let isValid = true;
      const elements = initializeElements();

      // 이메일 검증
      const email = elements.emailInput.value;
      if (!email) {
        showError('error-email', '이메일을 입력해주세요.');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError('error-email', validationRules.email.message);
        isValid = false;
      } else {
        hideError('error-email');
      }

      // 비밀번호 검증
      const password = elements.passwordInput.value;
      if (!password) {
        showError('error-password', '비밀번호를 입력해주세요.');
        isValid = false;
      } else if (!validatePassword(password)) {
        showError('error-password', validationRules.password.message);
        isValid = false;
      } else {
        hideError('error-password');
      }

      // 이름 검증
      const name = elements.nameInput.value;
      if (!name) {
        showError('error-name', '이름을 입력해주세요.');
        isValid = false;
      } else if (!validateName(name)) {
        showError('error-name', validationRules.name.message);
        isValid = false;
      } else {
        hideError('error-name');
      }

      // 닉네임 검증
      const nickname = elements.nicknameInput.value;
      if (!nickname) {
        showError('error-nickname', '닉네임을 입력해주세요.');
        isValid = false;
      } else if (!validateNickname(nickname)) {
        showError('error-nickname', validationRules.nickname.message);
        isValid = false;
      } else {
        hideError('error-nickname');
      }

      // 전화번호 검증
      const tel = elements.telInput.value;
      if (!tel) {
        showError('error-tel', '전화번호를 입력해주세요.');
        isValid = false;
      } else if (!validatePhone(tel)) {
        showError('error-tel', validationRules.phone.message);
        isValid = false;
      } else {
        hideError('error-tel');
      }

      // 성별 검증
      const gender = elements.genderSelect.value;
      if (!gender) {
        showError('error-gender', '성별을 선택해주세요.');
        isValid = false;
      } else {
        hideError('error-gender');
      }

      // 생년월일 검증
      const birth = elements.birthHidden.value;
      if (!birth) {
        showError('error-birth', '생년월일을 입력해주세요.');
        isValid = false;
      } else if (!validateBirth(birth)) {
        showError('error-birth', '만 14세 이상 100세 이하만 가입 가능합니다.');
        isValid = false;
      } else {
        hideError('error-birth');
      }

      // 주소 검증
      if (!validateAddress()) {
        showError('error-address', '주소를 모두 입력해주세요.');
        isValid = false;
      } else {
        hideError('error-address');
      }

      return isValid;
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
      const elements = initializeElements();

      // 폼 제출 시 유효성 검사
      if (elements.form) {
        elements.form.addEventListener('submit', function(e) {
          if (!validateForm()) {
            e.preventDefault();
            alert('입력 정보를 확인해주세요.');
            return false;
          }
        });
      }
    }

    // 초기화
    document.addEventListener("DOMContentLoaded", () => {
      // 생년월일 선택기 초기화
      populateBirthSelectors();
      
      // 실시간 유효성 검사 설정
      setupRealTimeValidation();
      
      // 이벤트 리스너 설정
      setupEventListeners();
    });
  