/**
 * 결제 페이지 관리자 클래스
 * 주문/결제 페이지의 모든 기능을 관리합니다.
 */
class PaymentManager {
    constructor() {
        this.buyerId = null;
        this.orderForm = null;
        this.elements = this.initializeElements();
        this.validationRules = this.defineValidationRules();
        
        this.initialize();
        this.bindEvents();
    }

    /**
     * DOM 요소들을 초기화합니다.
     * @returns {Object} 초기화된 DOM 요소들
     */
    initializeElements() {
        return {
            // 폼 요소
            form: document.getElementById('paymentForm'),
            buyerIdInput: document.getElementById('buyerId'),
            
            // 주문 상품 목록
            orderItemsList: document.getElementById('orderItemsList'),
            
            // 배송지 정보
            recipientName: document.getElementById('recipientName'),
            recipientPhone: document.getElementById('recipientPhone'),
            postcode: document.getElementById('postcode'),
            address: document.getElementById('address'),
            detailAddress: document.getElementById('detailAddress'),
            searchPostcodeBtn: document.getElementById('searchPostcodeBtn'),
            
            // 결제 수단
            paymentMethodRadios: document.querySelectorAll('input[name="paymentMethod"]'),
            bankPaymentInfo: document.getElementById('bankPaymentInfo'),
            cardPaymentInfo: document.getElementById('cardPaymentInfo'),
            
            // 카드 정보
            cardNumberInputs: [
                document.getElementById('cardNumber1'),
                document.getElementById('cardNumber2'),
                document.getElementById('cardNumber3'),
                document.getElementById('cardNumber4')
            ],
            cardExpiryMonth: document.getElementById('cardExpiryMonth'),
            cardExpiryYear: document.getElementById('cardExpiryYear'),
            cardCVC: document.getElementById('cardCVC'),
            cardPassword: document.getElementById('cardPassword'),
            
            // 결제 버튼 및 요약
            payBtn: document.getElementById('payBtn'),
            summarySubtotal: document.getElementById('summarySubtotal'),
            summaryShipping: document.getElementById('summaryShipping'),
            summaryTotal: document.getElementById('summaryTotal'),
            
            // 모달
            orderCompleteModal: document.getElementById('orderCompleteModal')
        };
    }

    /**
     * 검증 규칙을 정의합니다.
     * @returns {Object} 검증 규칙 객체
     */
    defineValidationRules() {
        return {
            // 필수 입력 검증
            required: (value) => value.trim() !== '',
            
            // 받는 분 이름 검증 (최소 2자 이상)
            recipientName: (value) => value.trim().length >= 2,
            
            // 휴대폰 번호 검증 (010-XXXX-XXXX 형식, 13자리)
            phone: (value) => {
                const phoneRegex = /^010-[0-9]{4}-[0-9]{4}$/;
                return phoneRegex.test(value) && value.length === 13;
            },
            
            // 카드번호 검증 (4자리 숫자)
            cardNumber: (value) => {
                const cardRegex = /^[0-9]{4}$/;
                return cardRegex.test(value);
            },
            
            // 카드 유효기간 월 검증 (01-12)
            expiryMonth: (value) => {
                const month = parseInt(value);
                return month >= 1 && month <= 12;
            },
            
            // 카드 유효기간 년 검증 (00-99)
            expiryYear: (value) => {
                const year = parseInt(value);
                return year >= 0 && year <= 99;
            },
            
            // CVC 검증 (3자리 숫자)
            cvc: (value) => {
                const cvcRegex = /^[0-9]{3}$/;
                return cvcRegex.test(value);
            },
            
            // 카드 비밀번호 검증 (4자리 숫자)
            password: (value) => {
                const passwordRegex = /^[0-9]{4}$/;
                return passwordRegex.test(value);
            }
        };
    }

    /**
     * 페이지를 초기화합니다.
     */
    async initialize() {
        console.log('결제 페이지 초기화 시작...');
        
        try {
            // 구매자 ID 설정
            this.setBuyerId();
            
            // 주문 정보 로드
            await this.loadOrderData();
            
            // 매진 상품 체크
            await this.checkSoldOutProducts();
            
            console.log('결제 페이지 초기화 완료');
        } catch (error) {
            console.error('결제 페이지 초기화 중 오류:', error);
            alert('페이지 로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 구매자 ID를 설정합니다.
     */
    setBuyerId() {
        let buyerId = sessionStorage.getItem('buyerId');
        console.log('세션 스토리지 buyerId:', buyerId);
        
        // 세션 스토리지의 buyerId가 유효하지 않으면 제거
        if (buyerId && (buyerId === '[object HTMLInputElement]' || typeof buyerId === 'object')) {
            console.log('세션 스토리지의 buyerId가 유효하지 않음, 제거함');
            sessionStorage.removeItem('buyerId');
            buyerId = null;
        }
        
        if (!buyerId) {
            // Thymeleaf에서 설정된 buyerId 사용
            buyerId = currentBuyerId;
            console.log('Thymeleaf에서 가져온 buyerId:', buyerId);
        }
        
        console.log('최종 buyerId:', buyerId, '타입:', typeof buyerId);
        
        if (!buyerId) {
            alert('로그인 정보가 없습니다.');
            window.location.href = '/buyer/login';
            return;
        }
        
        this.buyerId = buyerId;
    }

    /**
     * 주문 데이터를 로드합니다.
     */
    async loadOrderData() {
        const orderFormData = sessionStorage.getItem('orderForm');
        if (!orderFormData) {
            alert('주문 정보가 없습니다. 장바구니로 돌아갑니다.');
            window.location.href = '/buyer/cart';
            return;
        }
        
        this.orderForm = JSON.parse(orderFormData);
        console.log('주문 데이터 로드 완료:', this.orderForm);
    }

    /**
     * 매진 상품을 체크합니다.
     */
    async checkSoldOutProducts() {
        try {
            const soldOutProducts = await this.fetchSoldOutProducts(this.orderForm.items);
            
            if (soldOutProducts.length > 0) {
                alert('매진된 상품이 포함되어 있습니다. 장바구니를 확인해주세요.');
                window.location.href = '/buyer/cart/' + this.buyerId;
                return;
            }
            
            // 주문 상품 목록 렌더링
            this.renderOrderItems();
            
            // 결제 금액 업데이트
            this.updatePaymentSummary();
            
        } catch (error) {
            console.error('매진 상품 체크 중 오류:', error);
            alert('상품 재고 확인 중 오류가 발생했습니다.');
            window.location.href = '/buyer/cart/' + this.buyerId;
        }
    }

    /**
     * 매진 상품을 조회합니다.
     * @param {Array} items - 상품 목록
     * @returns {Array} 매진된 상품 목록
     */
    async fetchSoldOutProducts(items) {
        const productIds = items.map(item => item.productId);
        
        try {
            const response = await fetch('/api/cart/check-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productIds)
            });
            
            const data = await response.json();
            
            if (data.header && data.header.rtcd === 'S00') {
                return data.body || [];
            } else {
                console.error('매진 상품 체크 실패:', data);
                return [];
            }
        } catch (error) {
            console.error('매진 상품 체크 중 오류:', error);
            return [];
        }
    }

    /**
     * 이벤트 리스너들을 바인딩합니다.
     */
    bindEvents() {
        // 주소 검색
        this.elements.searchPostcodeBtn.addEventListener('click', () => this.openPostcodeSearch());
        
        // 연락처 자동 하이픈 및 실시간 검증
        this.elements.recipientPhone.addEventListener('input', (e) => this.formatPhoneNumber(e));
        this.elements.recipientPhone.addEventListener('blur', (e) => this.validatePhoneRealTime(e));
        
        // 받는 분 실시간 검증
        this.elements.recipientName.addEventListener('blur', (e) => this.validateNameRealTime(e));
        
        // 결제 수단 변경
        this.elements.paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePaymentMethodChange(e));
        });
        
        // 카드번호 자동 포커스 이동
        this.setupCardNumberInputs();
        
        // 숫자만 입력 가능하도록 설정
        this.setupNumericInputs();
        
        // 폼 제출
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /**
     * 주소 검색을 엽니다.
     */
    openPostcodeSearch() {
        new daum.Postcode({
            oncomplete: (data) => {
                this.elements.postcode.value = data.zonecode;
                this.elements.address.value = data.address;
                this.elements.detailAddress.focus();
            }
        }).open();
    }

    /**
     * 전화번호를 포맷팅합니다.
     * @param {Event} e - 입력 이벤트
     */
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // 최대 11자리로 제한
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // 010으로 시작하지 않으면 010으로 강제 변경
        if (!value.startsWith('010')) {
            value = '010' + value.substring(3);
        }
        
        let result = '';
        if (value.length < 4) {
            result = value;
        } else if (value.length < 8) {
            result = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length < 11) {
            result = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        } else {
            result = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
        }
        e.target.value = result;
    }

    /**
     * 받는 분 이름을 실시간 검증합니다.
     * @param {Event} e - blur 이벤트
     */
    validateNameRealTime(e) {
        const value = e.target.value.trim();
        const errorElement = document.getElementById('recipientNameError');
        
        if (value && !this.validationRules.recipientName(value)) {
            e.target.style.borderColor = '#ff4444';
            this.showFieldError('recipientNameError', '받는 분은 최소 2자 이상 입력해주세요.');
        } else {
            e.target.style.borderColor = '';
            this.hideFieldError('recipientNameError');
        }
    }

    /**
     * 전화번호를 실시간 검증합니다.
     * @param {Event} e - blur 이벤트
     */
    validatePhoneRealTime(e) {
        const value = e.target.value.trim();
        
        if (value && !this.validationRules.phone(value)) {
            e.target.style.borderColor = '#ff4444';
            this.showFieldError('recipientPhoneError', '올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-0000-0000)');
        } else {
            e.target.style.borderColor = '';
            this.hideFieldError('recipientPhoneError');
        }
    }

    /**
     * 결제 수단 변경을 처리합니다.
     * @param {Event} e - change 이벤트
     */
    handlePaymentMethodChange(e) {
        if (e.target.value === 'bank') {
            this.elements.bankPaymentInfo.style.display = 'block';
            this.elements.cardPaymentInfo.style.display = 'none';
        } else if (e.target.value === 'card') {
            this.elements.bankPaymentInfo.style.display = 'none';
            this.elements.cardPaymentInfo.style.display = 'block';
        }
    }

    /**
     * 카드번호 입력 설정을 초기화합니다.
     */
    setupCardNumberInputs() {
        this.elements.cardNumberInputs.forEach((input, index) => {
            if (input) {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 4 && index < 3) {
                        this.elements.cardNumberInputs[index + 1].focus();
                    }
                });
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
                        this.elements.cardNumberInputs[index - 1].focus();
                    }
                });
            }
        });
    }

    /**
     * 숫자만 입력 가능하도록 설정합니다.
     */
    setupNumericInputs() {
        const numericInputs = [
            ...this.elements.cardNumberInputs,
            this.elements.cardExpiryMonth,
            this.elements.cardExpiryYear,
            this.elements.cardCVC,
            this.elements.cardPassword
        ];
        
        numericInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            }
        });
    }

    /**
     * 주문 상품 목록을 렌더링합니다.
     */
    renderOrderItems() {
        this.elements.orderItemsList.innerHTML = '';
        
        this.orderForm.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <input type="hidden" name="productId" value="${item.productId}" />
                <input type="hidden" name="quantity" value="${item.quantity}" />
                <img src="${item.productThumbnail || '/images/product-placeholder.jpg'}" 
                     alt="${item.productTitle || '상품 이미지'}">
                <div class="info">
                    <p class="name">${item.productTitle || `상품 ID: ${item.productId}`}</p>
                    <p class="quantity">수량: ${item.quantity}개</p>
                </div>
                <p class="price">${this.formatNumber(item.totalPrice)}원</p>
            `;
            this.elements.orderItemsList.appendChild(itemElement);
        });
    }

    /**
     * 결제 금액 요약을 업데이트합니다.
     */
    updatePaymentSummary() {
        this.elements.summarySubtotal.textContent = this.formatNumber(this.orderForm.totalPrice) + '원';
        this.elements.summaryShipping.textContent = this.formatNumber(this.orderForm.totalDeliveryFee) + '원';
        this.elements.summaryTotal.textContent = this.formatNumber(this.orderForm.totalPrice + this.orderForm.totalDeliveryFee) + '원';
    }

    /**
     * 숫자를 포맷팅합니다.
     * @param {number} num - 포맷팅할 숫자
     * @returns {string} 포맷팅된 문자열
     */
    formatNumber(num) {
        return num.toLocaleString();
    }

    /**
     * 폼을 검증합니다.
     * @returns {Array} 검증 오류 목록
     */
    validateForm() {
        const errors = [];
        
        // 모든 오류 메시지 초기화
        this.clearAllErrors();
        
        // 기본 정보 검증
        if (!this.elements.recipientName.value.trim()) {
            this.showFieldError('recipientNameError', '받는 분 이름을 입력해주세요.');
            errors.push('받는 분 이름을 입력해주세요.');
        } else if (!this.validationRules.recipientName(this.elements.recipientName.value)) {
            this.showFieldError('recipientNameError', '받는 분은 최소 2자 이상 입력해주세요.');
            errors.push('받는 분은 최소 2자 이상 입력해주세요.');
        }
        
        if (!this.elements.recipientPhone.value.trim()) {
            this.showFieldError('recipientPhoneError', '연락처를 입력해주세요.');
            errors.push('연락처를 입력해주세요.');
        } else if (!this.validationRules.phone(this.elements.recipientPhone.value)) {
            this.showFieldError('recipientPhoneError', '올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-0000-0000)');
            errors.push('올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-0000-0000)');
        }
        
        if (!this.elements.postcode.value.trim()) {
            this.showFieldError('postcodeError', '우편번호를 입력해주세요.');
            errors.push('우편번호를 입력해주세요.');
        }
        
        if (!this.elements.address.value.trim()) {
            this.showFieldError('addressError', '주소를 입력해주세요.');
            errors.push('주소를 입력해주세요.');
        }
        
        if (!this.elements.detailAddress.value.trim()) {
            this.showFieldError('detailAddressError', '상세주소를 입력해주세요.');
            errors.push('상세주소를 입력해주세요.');
        }
        
        // 결제 수단별 검증
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (paymentMethod === 'card') {
            const cardErrors = this.validateCardInfo();
            errors.push(...cardErrors);
        }
        
        return errors;
    }

    /**
     * 카드 정보를 검증합니다.
     * @returns {Array} 검증 오류 목록
     */
    validateCardInfo() {
        const errors = [];
        
        // 카드번호 검증
        this.elements.cardNumberInputs.forEach((input, index) => {
            if (!this.validationRules.cardNumber(input.value)) {
                errors.push(`카드번호 ${index + 1}번째 자리를 입력해주세요.`);
            }
        });
        
        // 유효기간 검증
        if (!this.validationRules.expiryMonth(this.elements.cardExpiryMonth.value)) {
            errors.push('카드 유효기간(월)을 입력해주세요.');
        }
        
        if (!this.validationRules.expiryYear(this.elements.cardExpiryYear.value)) {
            errors.push('카드 유효기간(년)을 입력해주세요.');
        }
        
        // CVC 검증
        if (!this.validationRules.cvc(this.elements.cardCVC.value)) {
            errors.push('CVC를 입력해주세요.');
        }
        
        // 비밀번호 검증
        if (!this.validationRules.password(this.elements.cardPassword.value)) {
            errors.push('카드 비밀번호를 입력해주세요.');
        }
        
        return errors;
    }

    /**
     * 폼 제출을 처리합니다.
     * @param {Event} e - submit 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        console.log('폼 제출 시도...');
        
        // 폼 검증
        const errors = this.validateForm();
        if (errors.length > 0) {
            // 첫 번째 오류 필드로 스크롤
            this.scrollToFirstError();
            return;
        }
        
        console.log('폼 검증 성공, 주문 처리 시작...');
        this.setLoadingState(true);
        
        try {
            // 주문 데이터 구성
            const orderData = this.buildOrderData();
            
            // 주문 처리 API 호출
            const response = await fetch('/api/order/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            
            console.log('API 응답 상태:', response.status);
            const data = await response.json();
            console.log('API 응답 데이터:', data);
            
            if (data.header && data.header.rtcd === 'S00') {
                console.log('주문 성공! 후속 처리 시작...');
                await this.handleOrderSuccess();
            } else {
                console.error('API 오류:', data);
                alert('주문 처리 중 오류가 발생했습니다. 응답: ' + (data.header ? data.header.rtmsg : '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('Order Error:', error);
            alert('주문 처리 중 오류가 발생했습니다. 네트워크 오류를 확인해주세요.');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 주문 데이터를 구성합니다.
     * @returns {Object} 주문 데이터 객체
     */
    buildOrderData() {
        const formData = new FormData(this.elements.form);
        
        return {
            buyerId: null, // 세션에서 가져올 예정
            name: formData.get('recipientName'),
            tel: formData.get('recipientPhone'),
            deliveryAddress: formData.get('postcode') + ' ' + formData.get('address') + ' ' + formData.get('detailAddress'),
            totalPrice: this.orderForm.totalPrice + this.orderForm.totalDeliveryFee,
            items: this.orderForm.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Math.floor(item.totalPrice / item.quantity),
                totalPrice: item.totalPrice,
                deliveryCompany: null,
                trackingNumber: null
            }))
        };
    }

    /**
     * 주문 성공을 처리합니다.
     */
    async handleOrderSuccess() {
        try {
            // 장바구니 업데이트
            await this.updateCartItemsChecked();
            
            // 결제 완료 상품 삭제
            await this.deleteCompletedItems();
            
            // 모달 표시
            this.showOrderCompleteModal();
            
        } catch (error) {
            console.error('주문 성공 후 처리 중 오류:', error);
            this.showOrderCompleteModal();
        }
    }

    /**
     * 장바구니 아이템을 업데이트합니다.
     */
    async updateCartItemsChecked() {
        console.log('=== 장바구니 업데이트 시작 ===');
        
        try {
            // 장바구니 데이터 가져오기
            const response = await fetch(`/api/cart/${this.buyerId}`);
            const data = await response.json();
            
            if (data.header && data.header.rtcd === 'S00' && data.body && data.body.length > 0) {
                const cartItems = data.body;
                const cartIdsToUpdate = [];
                
                // 주문된 상품들의 cartId 찾기
                this.orderForm.items.forEach(orderItem => {
                    const matchingCartItems = cartItems.filter(cart => 
                        cart.productId === orderItem.productId && cart.isChecked !== 'Y'
                    );
                    
                    matchingCartItems.forEach(cartItem => {
                        cartIdsToUpdate.push(cartItem.cartId);
                    });
                });
                
                // 병렬로 업데이트 실행
                if (cartIdsToUpdate.length > 0) {
                    const updatePromises = cartIdsToUpdate.map(async (cartId) => {
                        try {
                            const updateResponse = await fetch('/api/cart/check', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cartId: cartId })
                            });
                            
                            const result = await updateResponse.json();
                            return result.header && result.header.rtcd === 'S00';
                        } catch (error) {
                            console.error(`Cart ${cartId} 업데이트 중 오류:`, error);
                            return false;
                        }
                    });
                    
                    await Promise.all(updatePromises);
                    console.log('장바구니 업데이트 완료');
                }
            }
        } catch (error) {
            console.error('장바구니 업데이트 중 오류:', error);
        }
    }

    /**
     * 결제 완료된 상품을 삭제합니다.
     */
    async deleteCompletedItems() {
        console.log('결제 완료된 상품 삭제 시작');
        
        try {
            const response = await fetch('/api/cart/delete-completed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseInt(this.buyerId))
            });

            const data = await response.json();
            
            if (data.header && data.header.rtcd === 'S00') {
                console.log('결제 완료된 상품 삭제 성공');
            } else {
                console.error('결제 완료된 상품 삭제 실패:', data);
            }
        } catch (error) {
            console.error('결제 완료 상품 삭제 중 오류:', error);
        }
    }

    /**
     * 로딩 상태를 설정합니다.
     * @param {boolean} loading - 로딩 상태
     */
    setLoadingState(loading) {
        if (loading) {
            this.elements.payBtn.classList.add('loading');
            this.elements.payBtn.textContent = '결제 처리 중...';
            this.elements.payBtn.disabled = true;
        } else {
            this.elements.payBtn.classList.remove('loading');
            this.elements.payBtn.textContent = '결제하기';
            this.elements.payBtn.disabled = false;
        }
    }

    /**
     * 주문 완료 모달을 표시합니다.
     */
    showOrderCompleteModal() {
        this.elements.orderCompleteModal.classList.add('active');
    }

    /**
     * 특정 필드의 오류 메시지를 표시합니다.
     * @param {string} errorId - 오류 메시지 요소의 ID
     * @param {string} message - 표시할 오류 메시지
     */
    showFieldError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    /**
     * 특정 필드의 오류 메시지를 숨깁니다.
     * @param {string} errorId - 오류 메시지 요소의 ID
     */
    hideFieldError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    /**
     * 모든 오류 메시지를 초기화합니다.
     */
    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
            element.textContent = '';
        });
    }

    /**
     * 첫 번째 오류 필드로 스크롤합니다.
     */
    scrollToFirstError() {
        const firstError = document.querySelector('.error-message.show');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
}

/**
 * 결제 완료 페이지로 이동합니다.
 */
function goToPaymentComplete() {
    window.location.href = '/buyer/payment_complete';
}

/**
 * 페이지 로드 시 PaymentManager를 초기화합니다.
 */
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});
