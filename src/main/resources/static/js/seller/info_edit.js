
    // ===== 상수 정의 =====
    const ADDRESS_FIELDS = {
      POST_NUMBER: 'postNumber',
      BASIC_ADDRESS: 'basicAddress',
      DETAIL_ADDRESS: 'detailAddress',
      SHOP_ADDRESS: 'shopAddress'
  };

  // ===== 클래스 정의 =====
  class AddressManager {
      constructor() {
          this.postNumberInput = document.getElementById(ADDRESS_FIELDS.POST_NUMBER);
          this.basicAddressInput = document.getElementById(ADDRESS_FIELDS.BASIC_ADDRESS);
          this.detailAddressInput = document.getElementById(ADDRESS_FIELDS.DETAIL_ADDRESS);
          this.shopAddressInput = document.getElementById(ADDRESS_FIELDS.SHOP_ADDRESS);
          this.searchButton = document.getElementById('btn-postNumber');
          this.form = document.getElementById('sellerEditForm');
          
          this.init();
      }

      init() {
          this.bindEvents();
          this.initializeAddressFields();
      }

      bindEvents() {
          // 주소 검색 버튼 클릭
          this.searchButton.addEventListener('click', () => this.openAddressSearch());
          
          // 폼 제출 전 주소 합치기
          this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
          
          // 상세주소 입력 시 엔터키 처리
          this.detailAddressInput.addEventListener('keyup', (e) => {
              if (e.key === 'Enter') {
                  this.form.requestSubmit();
              }
          });
      }

      initializeAddressFields() {
          // 기존 주소 데이터가 있다면 필드에 설정
          const currentAddress = this.shopAddressInput.value;
          if (currentAddress) {
              this.parseAndSetAddress(currentAddress);
          }
      }

      openAddressSearch() {
          new daum.Postcode({
              oncomplete: (data) => {
                  this.postNumberInput.value = data.zonecode;
                  this.basicAddressInput.value = data.roadAddress || data.jibunAddress;
                  this.detailAddressInput.focus();
              },
              onclose: () => {
                  // 주소 검색이 취소된 경우 처리
                  if (!this.postNumberInput.value) {
                      this.detailAddressInput.focus();
                  }
              }
          }).open();
      }

      parseAndSetAddress(fullAddress) {
          // 주소 문자열을 파싱하여 각 필드에 설정
          const addressParts = fullAddress.split(' ');
          if (addressParts.length >= 3) {
              this.postNumberInput.value = addressParts[0];
              this.basicAddressInput.value = addressParts.slice(1, -1).join(' ');
              this.detailAddressInput.value = addressParts[addressParts.length - 1];
          }
      }

      handleFormSubmit(event) {
          // 폼 유효성 검사
          if (!this.validateForm()) {
              event.preventDefault();
              return;
          }

          // 주소 필드 합치기
          this.combineAddress();
          
          // 로딩 상태 표시
          this.showLoading();
      }

      validateForm() {
          const requiredFields = [
              { element: this.postNumberInput, name: '우편번호' },
              { element: this.basicAddressInput, name: '주소' },
              { element: this.detailAddressInput, name: '상세주소' }
          ];

          for (const field of requiredFields) {
              if (!field.element.value.trim()) {
                  this.showError(`${field.name}을(를) 입력해주세요.`, field.element);
                  field.element.focus();
                  return false;
              }
          }

          return true;
      }

      combineAddress() {
          const postNumber = this.postNumberInput.value.trim();
          const basicAddress = this.basicAddressInput.value.trim();
          const detailAddress = this.detailAddressInput.value.trim();

          const fullAddress = `${postNumber} ${basicAddress} ${detailAddress}`;
          this.shopAddressInput.value = fullAddress;
      }

      showError(message, element = null) {
          // 에러 메시지 표시 로직
          console.error(message);
          if (element) {
              element.style.borderColor = 'var(--color-danger)';
              setTimeout(() => {
                  element.style.borderColor = '';
              }, 3000);
          }
      }

      showLoading() {
          const submitButton = document.getElementById('update-btn');
          submitButton.disabled = true;
          submitButton.textContent = '수정 중...';
          submitButton.classList.add('loading');
      }
  }

  // ===== 초기화 =====
  document.addEventListener('DOMContentLoaded', () => {
      new AddressManager();
  });
