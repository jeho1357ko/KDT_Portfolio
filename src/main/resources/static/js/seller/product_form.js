
// ===== 상품 등록 폼 관리자 클래스 =====
class ProductFormManager {
  constructor() {
    this.form = document.getElementById('productForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.fields = this.initializeFields();
    this.validationRules = this.defineValidationRules();
    
    this.bindEvents();
    this.initializeForm();
  }

  // ===== 필드 초기화 =====
  initializeFields() {
    return {
      productName: {
        element: document.getElementById('productName'),
        group: document.getElementById('productNameGroup'),
        error: document.getElementById('productNameError'),
        required: true,
        minLength: 2,
        maxLength: 200
      },
      title: {
        element: document.getElementById('title'),
        group: document.getElementById('titleGroup'),
        error: document.getElementById('titleError'),
        required: true,
        minLength: 5,
        maxLength: 200
      },
      content: {
        element: document.getElementById('content'),
        group: document.getElementById('contentGroup'),
        error: document.getElementById('contentError'),
        required: true,
        minLength: 10,
        maxLength: null  // CLOB 타입이므로 길이 제한 없음
      },
      countryOfOrigin: {
        element: document.getElementById('countryOfOrigin'),
        group: document.getElementById('countryOfOriginGroup'),
        error: document.getElementById('countryOfOriginError'),
        required: true,
        minLength: 2,
        maxLength: 60
      },
             price: {
         element: document.getElementById('price'),
         group: document.getElementById('priceGroup'),
         error: document.getElementById('priceError'),
         required: true,
         min: 0,
         max: 9999999999,
         maxLength: 10
       },
      quantity: {
        element: document.getElementById('quantity'),
        group: document.getElementById('quantityGroup'),
        error: document.getElementById('quantityError'),
        required: true,
        min: 0,
        max: 9999999999,
        maxLength: 10
      },
      status: {
        element: document.getElementById('status'),
        group: document.getElementById('statusGroup'),
        error: document.getElementById('statusError'),
        required: true
      },
      thumbnail: {
        element: document.getElementById('thumbnail'),
        group: document.getElementById('thumbnailGroup'),
        error: document.getElementById('thumbnailError'),
        required: false,
        maxLength: 255,
        pattern: /^https?:\/\/.+/
      },
      deliveryFee: {
        element: document.getElementById('deliveryFee'),
        group: document.getElementById('deliveryFeeGroup'),
        error: document.getElementById('deliveryFeeError'),
        required: true,
        min: 0,
        max: 99999,
        maxLength: 5
      },
      deliveryMethod: {
        element: document.getElementById('deliveryMethod'),
        group: document.getElementById('deliveryMethodGroup'),
        error: document.getElementById('deliveryMethodError'),
        required: false,
        maxLength: 30
      },
      deliveryInformation: {
        element: document.getElementById('deliveryInformation'),
        group: document.getElementById('deliveryInformationGroup'),
        error: document.getElementById('deliveryInformationError'),
        required: false,
        maxLength: 200
      }
    };
  }

  // ===== 검증 규칙 정의 =====
  defineValidationRules() {
    return {
      required: (value) => value.trim() !== '' || '이 필드는 필수입니다.',
      minLength: (value, min) => value.length >= min || `최소 ${min}자 이상 입력해주세요.`,
      maxLength: (value, max) => value.length <= max || `최대 ${max}자까지 입력 가능합니다.`,
      min: (value, min) => Number(value) >= min || `최소값은 ${min}입니다.`,
      max: (value, max) => Number(value) <= max || `최대값은 ${max}입니다.`,
      pattern: (value, pattern) => pattern.test(value) || '올바른 형식이 아닙니다.',
      url: (value) => {
        if (!value) return true; // 선택사항이므로 빈 값 허용
        try {
          new URL(value);
          return true;
        } catch {
          return '올바른 URL 형식이 아닙니다.';
        }
      }
    };
  }

  // ===== 이벤트 바인딩 =====
  bindEvents() {
    // 폼 제출 이벤트
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // 실시간 검증 이벤트
    Object.values(this.fields).forEach(field => {
      if (field.element) {
        field.element.addEventListener('blur', () => this.validateField(field));
        field.element.addEventListener('input', () => this.clearFieldError(field));
        field.element.addEventListener('keypress', (e) => this.handleKeyPress(e));
      }
    });
    
    // 가격 입력 시 자동 포맷팅 제거 (3자리 제한 문제 해결)
    // this.fields.price.element.addEventListener('input', (e) => this.formatPrice(e));
    
    // 수량 입력 시 자동 포맷팅
    this.fields.quantity.element.addEventListener('input', (e) => this.formatQuantity(e));
    
    // 상품명 입력 시 실시간 매칭 검색
    this.fields.productName.element.addEventListener('input', (e) => this.searchMatchingProducts(e));
    
    // 숫자 필드에 길이 제한 추가
    this.fields.price.element.addEventListener('input', (e) => this.limitInputLength(e, 10));
    this.fields.quantity.element.addEventListener('input', (e) => this.limitInputLength(e, 10));
    this.fields.deliveryFee.element.addEventListener('input', (e) => this.limitInputLength(e, 5));
  }

  // ===== 폼 초기화 =====
  initializeForm() {
    // 초기 상태 설정
    Object.values(this.fields).forEach(field => {
      if (field.element) {
        this.clearFieldError(field);
      }
    });
    
    console.log('상품 등록 폼이 초기화되었습니다.');
  }

  // ===== 입력 길이 제한 =====
  limitInputLength(e, maxLength) {
    const value = e.target.value;
    if (value.length > maxLength) {
      e.target.value = value.slice(0, maxLength);
    }
  }

  // ===== 필드 검증 =====
  validateField(field) {
    const value = field.element.value.trim();
    const errors = [];

    // 필수 검증
    if (field.required && !this.validationRules.required(value)) {
      errors.push(this.validationRules.required(value));
    }

    // 값이 있는 경우에만 추가 검증
    if (value) {
      // 길이 검증
      if (field.minLength) {
        const result = this.validationRules.minLength(value, field.minLength);
        if (result !== true) errors.push(result);
      }
      
      if (field.maxLength) {
        const result = this.validationRules.maxLength(value, field.maxLength);
        if (result !== true) errors.push(result);
      }

      // 숫자 범위 검증
      if (field.min !== undefined) {
        const result = this.validationRules.min(value, field.min);
        if (result !== true) errors.push(result);
      }
      
      if (field.max !== undefined) {
        const result = this.validationRules.max(value, field.max);
        if (result !== true) errors.push(result);
      }

      // 패턴 검증
      if (field.pattern) {
        const result = this.validationRules.pattern(value, field.pattern);
        if (result !== true) errors.push(result);
      }

      // URL 검증
      if (field.element.type === 'url') {
        const result = this.validationRules.url(value);
        if (result !== true) errors.push(result);
      }
    }

    // 에러 표시 또는 제거
    if (errors.length > 0) {
      this.showFieldError(field, errors[0]);
      return false;
    } else {
      this.showFieldSuccess(field);
      return true;
    }
  }

  // ===== 에러 표시 =====
  showFieldError(field, message) {
    field.group.classList.remove('success');
    field.group.classList.add('error');
    field.error.textContent = message;
    field.error.classList.add('show');
  }

  // ===== 성공 표시 =====
  showFieldSuccess(field) {
    field.group.classList.remove('error');
    field.group.classList.add('success');
    field.error.classList.remove('show');
  }

  // ===== 에러 제거 =====
  clearFieldError(field) {
    field.group.classList.remove('error', 'success');
    field.error.classList.remove('show');
  }

  // ===== 전체 폼 검증 =====
  validateForm() {
    let isValid = true;
    
    Object.values(this.fields).forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  // ===== 폼 제출 처리 =====
  handleSubmit(e) {
    e.preventDefault();
    
    console.log('폼 제출 시도...');
    
    if (!this.validateForm()) {
      console.log('폼 검증 실패');
      this.scrollToFirstError();
      return false;
    }
    
    console.log('폼 검증 성공, 제출 진행...');
    this.setLoadingState(true);
    
    // 실제 제출
    setTimeout(() => {
      this.form.submit();
    }, 500);
  }

  // ===== 첫 번째 에러로 스크롤 =====
  scrollToFirstError() {
    const firstError = document.querySelector('.form-group.error');
    if (firstError) {
      firstError.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      firstError.querySelector('input, select, textarea')?.focus();
    }
  }

  // ===== 로딩 상태 설정 =====
  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.textContent = '등록 중...';
      this.submitBtn.disabled = true;
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.textContent = '등록';
      this.submitBtn.disabled = false;
    }
  }

  // ===== 가격 포맷팅 =====
  formatPrice(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      // 9자리까지 허용하도록 수정
      if (value.length <= 9) {
        // BigInt를 사용하여 큰 숫자 처리
        try {
          const numValue = BigInt(value);
          e.target.value = numValue.toLocaleString();
        } catch (error) {
          // BigInt 실패 시 일반 정수로 처리
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            e.target.value = numValue.toLocaleString();
          }
        }
      }
    }
  }

  // ===== 수량 포맷팅 =====
  formatQuantity(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    e.target.value = value;
  }

  // ===== 키 입력 처리 =====
  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = this.getNextField(e.target);
      if (nextField) {
        nextField.focus();
      }
    }
  }

  // ===== 다음 필드 찾기 =====
  getNextField(currentField) {
    const fieldNames = Object.keys(this.fields);
    const currentIndex = fieldNames.findIndex(name => 
      this.fields[name].element === currentField
    );
    
    if (currentIndex < fieldNames.length - 1) {
      return this.fields[fieldNames[currentIndex + 1]].element;
    }
    
    return null;
  }
  
  // ===== 실시간 상품명 매칭 검색 =====
  searchMatchingProducts(e) {
    const productName = e.target.value.trim();
    
    if (productName.length < 2) {
      this.hideMatchingProducts();
      return;
    }
    
    // 매칭 가능한 상품 검색 API 호출 (올바른 URL 사용)
    fetch(`/price/api/products/matching?name=${encodeURIComponent(productName)}`)
      .then(response => response.json())
      .then(data => {
        if (data.matchingProducts && data.matchingProducts.length > 0) {
          this.showMatchingProducts(data.matchingProducts, productName);
        } else {
          this.hideMatchingProducts();
        }
      })
      .catch(error => {
        console.error('매칭 상품 검색 오류:', error);
        this.hideMatchingProducts();
      });
  }
  
  // ===== 매칭 상품 목록 표시 =====
  showMatchingProducts(matchingProducts, searchTerm) {
    let matchingContainer = document.getElementById('matchingProductsContainer');
    
    if (!matchingContainer) {
      matchingContainer = document.createElement('div');
      matchingContainer.id = 'matchingProductsContainer';
      matchingContainer.className = 'matching-products-container';
      this.fields.productName.group.appendChild(matchingContainer);
    }
    
    let html = '<div class="matching-products-title">🔍 공공데이터 매칭 가능한 상품:</div>';
    html += '<div class="matching-products-list">';
    
    matchingProducts.forEach(product => {
      const isExactMatch = product.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = isExactMatch ? 'exact-match' : 'partial-match';
      html += `<div class="matching-product ${matchClass}">${product}</div>`;
    });
    
    html += '</div>';
    html += '<div class="matching-products-info">✅ 이 상품명으로 등록하면 자동으로 가격비교 기능이 활성화됩니다!</div>';
    
    matchingContainer.innerHTML = html;
    matchingContainer.style.display = 'block';
  }
  
  // ===== 매칭 상품 목록 숨기기 =====
  hideMatchingProducts() {
    const matchingContainer = document.getElementById('matchingProductsContainer');
    if (matchingContainer) {
      matchingContainer.style.display = 'none';
    }
  }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  new ProductFormManager();
});
