/**
 * 판매자 대시보드 JavaScript 모듈
 * 대시보드 데이터 로드, 이벤트 처리, 통계 수집 기능을 담당
 */

// ===== 대시보드 관리 클래스 =====
class DashboardManager {
    /**
     * 대시보드 관리자 생성
     */
    constructor() {
        this.initializeElements();
        this.init();
    }

    /**
     * DOM 요소 초기화
     */
    initializeElements() {
        this.salesListBtn = document.querySelector('button[onclick*="seller/list"]');
        this.addProductBtn = document.querySelector('button[onclick*="seller/add"]');
        this.successMessage = document.querySelector('.success-message');
    }

    /**
     * 초기화
     */
    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.trackPageView();
    }

    /**
     * 대시보드 데이터 로드
     */
    loadDashboardData() {
        // 현재는 서버에서 렌더링된 데이터를 사용
        // 향후 AJAX로 실시간 데이터 업데이트 가능
        console.log('대시보드 데이터 로드 완료');
        
        // 데이터 로드 완료 후 추가 처리
        this.updateDashboardStats();
    }

    /**
     * 대시보드 통계 업데이트
     */
    updateDashboardStats() {
        // 통계 데이터가 있는 경우 추가 처리
        const countElements = document.querySelectorAll('.count, .total-amount');
        if (countElements.length > 0) {
            console.log('대시보드 통계 업데이트 완료');
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        this.bindButtonEvents();
        this.bindMessageEvents();
    }

    /**
     * 버튼 이벤트 바인딩
     */
    bindButtonEvents() {
        if (this.salesListBtn) {
            this.salesListBtn.addEventListener('click', () => this.handleSalesListClick());
        }
        
        if (this.addProductBtn) {
            this.addProductBtn.addEventListener('click', () => this.handleAddProductClick());
        }
    }

    /**
     * 메시지 이벤트 바인딩
     */
    bindMessageEvents() {
        if (this.successMessage) {
            // 성공 메시지 자동 숨김
            setTimeout(() => {
                this.hideSuccessMessage();
            }, 5000);
        }
    }

    /**
     * 판매 목록 버튼 클릭 처리
     */
    handleSalesListClick() {
        console.log('판매 목록 페이지로 이동');
        // 추가 로직이 필요한 경우 여기에 구현
    }

    /**
     * 판매 상품 등록 버튼 클릭 처리
     */
    handleAddProductClick() {
        console.log('판매 상품 등록 페이지로 이동');
        // 추가 로직이 필요한 경우 여기에 구현
    }

    /**
     * 성공 메시지 숨김
     */
    hideSuccessMessage() {
        if (this.successMessage) {
            this.successMessage.style.opacity = '0';
            setTimeout(() => {
                this.successMessage.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 페이지 조회 통계 수집
     */
    trackPageView() {
        console.log('판매자 대시보드 페이지 조회');
        // Google Analytics나 다른 분석 도구 연동 가능
        this.sendAnalyticsData();
    }

    /**
     * 분석 데이터 전송
     */
    sendAnalyticsData() {
        // 분석 데이터 전송 로직
        // 예: Google Analytics, Mixpanel 등
        const pageData = {
            page: 'seller_dashboard',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.log('분석 데이터:', pageData);
    }

    /**
     * 실시간 데이터 새로고침
     */
    refreshData() {
        console.log('대시보드 데이터 새로고침');
        // AJAX를 통한 실시간 데이터 업데이트
        // this.loadDashboardData();
    }
}

// ===== 유틸리티 함수들 =====

/**
 * 숫자 포맷팅
 * @param {number} number - 포맷팅할 숫자
 * @param {string} locale - 로케일 (기본값: 'ko-KR')
 * @returns {string} 포맷팅된 숫자 문자열
 */
function formatNumber(number, locale = 'ko-KR') {
    return new Intl.NumberFormat(locale).format(number);
}

/**
 * 통화 포맷팅
 * @param {number} amount - 포맷팅할 금액
 * @param {string} currency - 통화 코드 (기본값: 'KRW')
 * @returns {string} 포맷팅된 통화 문자열
 */
function formatCurrency(amount, currency = 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * 날짜 포맷팅
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// ===== 초기화 =====
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    try {
        dashboardManager = new DashboardManager();
        console.log('판매자 대시보드 페이지 로드됨');
    } catch (error) {
        console.error('DashboardManager 초기화 실패:', error);
    }
});

// ===== 전역 함수 (필요시) =====
window.refreshDashboard = () => {
    if (dashboardManager) {
        dashboardManager.refreshData();
    }
};
