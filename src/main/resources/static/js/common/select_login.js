
  // 전역 변수로 이벤트 리스너 중복 등록 방지
  let isInitialized = false;
  let isPageActive = true;

  /**
   * 페이지 완전 초기화 함수
   */
  function initializePage() {
    console.log('페이지 초기화 시작');
    
    // 이미 초기화되었으면 중복 실행 방지
    if (isInitialized && isPageActive) {
      console.log('이미 초기화됨, 중복 실행 방지');
      return;
    }
    
    // 기존 이벤트 리스너 완전 정리
    cleanup();
    
    isInitialized = true;
    isPageActive = true;

    // 키보드 네비게이션 지원
    const cards = document.querySelectorAll('.selection-card');
    
    cards.forEach((card, index) => {
      // 카드 상태 초기화
      card.classList.remove('loading');
      card.style.opacity = '';
      card.style.pointerEvents = '';
      card.style.transform = '';
      card.removeAttribute('data-clicked');
      
      // 기존 로딩 텍스트 제거
      const existingLoading = card.querySelector('.loading-text');
      if (existingLoading) {
        existingLoading.remove();
      }
      
      // 새로운 이벤트 리스너 등록
      card.addEventListener('keydown', handleKeydown);
      card.addEventListener('focus', handleFocus);
      card.addEventListener('blur', handleBlur);
      card.addEventListener('click', handleCardClick);
      
      // 탭 인덱스 설정
      card.tabIndex = 0;
      
      console.log(`카드 ${index + 1} 이벤트 리스너 등록 완료`);
    });

    // 페이지 가시성 변경 시 처리
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 히스토리 상태 설정
    if (window.history && window.history.replaceState) {
      window.history.replaceState({ page: 'select-login', timestamp: Date.now() }, '', window.location.href);
    }
    
    console.log('페이지 초기화 완료');
  }

  /**
   * 키보드 이벤트 핸들러
   */
  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      this.click();
    }
  }

  /**
   * 포커스 이벤트 핸들러
   */
  function handleFocus() {
    this.style.transform = 'translateY(-4px)';
  }

  /**
   * 블러 이벤트 핸들러
   */
  function handleBlur() {
    this.style.transform = '';
  }

  /**
   * 카드 클릭 이벤트 핸들러
   */
  function handleCardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // 중복 클릭 방지
    if (this.dataset.clicked === 'true' || this.classList.contains('loading')) {
      console.log('중복 클릭 방지');
      return;
    }
    
    console.log('카드 클릭됨');
    this.dataset.clicked = 'true';
    showLoading(this);
    
    // 페이지 비활성화
    isPageActive = false;
  }

  /**
   * 페이지 가시성 변경 핸들러
   */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      console.log('로그인 선택 페이지가 활성화되었습니다.');
      // 페이지가 다시 보일 때 완전 초기화
      setTimeout(() => {
        isInitialized = false;
        isPageActive = true;
        initializePage();
      }, 200);
    } else {
      console.log('로그인 선택 페이지가 비활성화되었습니다.');
      isPageActive = false;
    }
  }

  /**
   * 카드 클릭 시 로딩 표시
   */
  function showLoading(card) {
    // 이미 로딩 중이면 중복 실행 방지
    if (card.classList.contains('loading')) {
      return;
    }
    
    console.log('이동 시작');
    card.classList.add('loading');
    card.style.opacity = '0.7';
    card.style.pointerEvents = 'none';
    
    // 실제 이동 처리 (즉시)
    const href = card.getAttribute('href');
    if (href) {
      window.location.href = href;
    }
  }

  /**
   * 페이지 언로드 시 정리
   */
  function cleanup() {
    console.log('페이지 정리 시작');
    isInitialized = false;
    isPageActive = false;
    
    const cards = document.querySelectorAll('.selection-card');
    cards.forEach(card => {
      // 이벤트 리스너 제거
      card.removeEventListener('keydown', handleKeydown);
      card.removeEventListener('focus', handleFocus);
      card.removeEventListener('blur', handleBlur);
      card.removeEventListener('click', handleCardClick);
      
      // 상태 초기화
      card.classList.remove('loading');
      card.style.opacity = '';
      card.style.pointerEvents = '';
      card.style.transform = '';
      card.removeAttribute('data-clicked');
      
      // 로딩 텍스트 제거
      const loadingText = card.querySelector('.loading-text');
      if (loadingText) {
        loadingText.remove();
      }
    });
    
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    console.log('페이지 정리 완료');
  }

  /**
   * 강제 페이지 리셋
   */
  function forceReset() {
    console.log('강제 페이지 리셋');
    cleanup();
    setTimeout(() => {
      isInitialized = false;
      isPageActive = true;
      initializePage();
    }, 100);
  }

  // DOMContentLoaded 이벤트 리스너
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    // DOM이 이미 로드된 경우
    initializePage();
  }

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('unload', cleanup);

  // 브라우저 뒤로가기/앞으로가기 처리
  window.addEventListener('popstate', function(event) {
    console.log('popstate 이벤트 발생', event);
    // 페이지 상태 변경 시 강제 리셋
    setTimeout(() => {
      forceReset();
    }, 150);
  });

  // 페이지 포커스/블러 처리
  window.addEventListener('focus', function() {
    console.log('윈도우 포커스');
    if (!isPageActive) {
      setTimeout(() => {
        forceReset();
      }, 100);
    }
  });

  window.addEventListener('blur', function() {
    console.log('윈도우 블러');
    isPageActive = false;
  });

  // 에러 처리
  window.addEventListener('error', function(e) {
    console.error('페이지 에러 발생:', e);
    setTimeout(() => {
      forceReset();
    }, 200);
  });

  // 전역 함수로 노출 (디버깅용)
  window.resetSelectLoginPage = forceReset;
