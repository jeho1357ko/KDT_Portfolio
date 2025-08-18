# YouTube API 설정 가이드

## 1. YouTube Data API v3 키 발급

### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인

### 1.2 프로젝트 생성/선택
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름 입력 (예: "planT-YouTube-API")
4. "만들기" 클릭

### 1.3 YouTube Data API v3 활성화
1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭
2. 검색창에 "YouTube Data API v3" 입력
3. "YouTube Data API v3" 클릭
4. "사용" 버튼 클릭

### 1.4 API 키 생성
1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 클릭
2. "사용자 인증 정보 만들기" > "API 키" 클릭
3. 생성된 API 키 복사

### 1.5 API 키 제한 설정 (권장)
1. 생성된 API 키 클릭
2. "애플리케이션 제한사항"에서 "HTTP 리퍼러" 선택
3. "API 제한사항"에서 "YouTube Data API v3" 선택
4. "저장" 클릭

## 2. 애플리케이션 설정

### 2.1 환경변수 설정
```bash
# Windows
set YOUTUBE_API_KEY=your_api_key_here

# Linux/Mac
export YOUTUBE_API_KEY=your_api_key_here
```

### 2.2 application.yml 직접 설정
```yaml
youtube:
  api:
    key: your_api_key_here
    max-results: 5
    region-code: KR
```

## 3. API 할당량 확인

### 3.1 기본 할당량
- 일일 할당량: 10,000건
- 초당 요청 수: 1,000건

### 3.2 할당량 확인 방법
1. Google Cloud Console > "API 및 서비스" > "할당량" 클릭
2. "YouTube Data API v3" 선택
3. 현재 사용량 확인

## 4. 테스트

### 4.1 애플리케이션 실행
```bash
./gradlew bootRun
```

### 4.2 검색 테스트
1. 브라우저에서 `http://localhost:9080/search?keyword=사과` 접속
2. 검색 결과와 함께 YouTube 영상이 표시되는지 확인

## 5. 문제 해결

### 5.1 API 키 오류
- API 키가 올바르게 설정되었는지 확인
- API 키에 제한이 있는지 확인

### 5.2 할당량 초과
- 일일 할당량을 초과한 경우 다음날까지 대기
- 할당량 증가 요청 가능

### 5.3 네트워크 오류
- 인터넷 연결 확인
- 방화벽 설정 확인

## 6. 보안 주의사항

⚠️ **중요**: API 키를 절대 공개 저장소에 업로드하지 마세요!

- `.gitignore`에 API 키 파일 추가
- 환경변수 사용 권장
- API 키 제한 설정 필수 