package com.kh.project.domain.svc;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.kh.project.domain.entity.Youtube;
import com.kh.project.web.api.YoutubeApiResponse;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class YoutubeApiService {
    
    private final RestTemplate restTemplate;
    
    @Value("${youtube.api.key:}")
    private String apiKey;
    
    @Value("${youtube.api.max-results:5}")
    private int maxResults;
    
    @Value("${youtube.api.region-code:KR}")
    private String regionCode;
    
    /**
     * 초기화 시 API 키 상태 확인
     */
    @PostConstruct
    public void init() {
        log.info("=== YouTube API 설정 확인 ===");
        log.info("API 키 설정 여부: {}", apiKey != null && !apiKey.isEmpty() ? "설정됨" : "설정되지 않음");
        log.info("API 키 길이: {}", apiKey != null ? apiKey.length() : 0);
        log.info("API 키 (처음 10자): {}", apiKey != null && apiKey.length() > 10 ? apiKey.substring(0, 10) + "..." : apiKey);
        log.info("최대 결과 수: {}", maxResults);
        log.info("지역 코드: {}", regionCode);
        log.info("================================");
    }
    
    /**
     * 키워드로 YouTube 영상 검색 (개선된 API 방식)
     */
    public List<Youtube> searchYoutubeVideos(String keyword) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("YouTube API 키가 설정되지 않았습니다.");
            return new ArrayList<>();
        }
        
        try {
            log.info("YouTube 검색 시작: {}", keyword);
            
            String url = buildSearchUrl(keyword);
            log.info("YouTube API URL: {}", url.replace(apiKey, "***"));
            
            // API 응답 가져오기
            YoutubeApiResponse response = restTemplate.getForObject(url, YoutubeApiResponse.class);
            
            if (response == null || response.getItems() == null) {
                log.warn("YouTube API 응답이 null이거나 items가 없습니다.");
                return new ArrayList<>();
            }
            
            log.info("YouTube API 응답 파싱 성공: {}개 아이템", response.getItems().size());
            
            List<Youtube> youtubeList = new ArrayList<>();
            for (YoutubeApiResponse.YoutubeItem item : response.getItems()) {
                try {
                    Youtube youtube = convertToYoutube(item);
                    if (youtube != null && youtube.getTitle() != null) {
                        // 관련성 있는 영상만 필터링
                        if (isRelevantVideo(youtube.getTitle())) {
                            youtubeList.add(youtube);
                        } else {
                            log.debug("관련성 없는 영상 제외: {}", youtube.getTitle());
                        }
                    }
                } catch (Exception e) {
                    log.warn("개별 YouTube 아이템 변환 실패: {}", e.getMessage());
                }
            }
            
            log.info("YouTube 검색 완료: {}개 영상 발견", youtubeList.size());
            return youtubeList;
            
        } catch (Exception e) {
            log.error("YouTube API 검색 중 오류 발생: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * YouTube API 검색 URL 생성 (개선된 키워드)
     */
    private String buildSearchUrl(String keyword) {
        return UriComponentsBuilder
            .fromHttpUrl("https://www.googleapis.com/youtube/v3/search")
            .queryParam("part", "snippet")
            .queryParam("q", keyword )
            .queryParam("type", "video")
            .queryParam("maxResults", maxResults)
            .queryParam("regionCode", regionCode)
            .queryParam("relevanceLanguage", "ko")
            .queryParam("videoEmbeddable", "true")
            .queryParam("order", "relevance")
            .queryParam("key", apiKey)
            .build()
            .toUriString();
    }
    
    /**
     * YouTube API 응답을 Youtube 엔티티로 변환
     */
    private Youtube convertToYoutube(YoutubeApiResponse.YoutubeItem item) {
        Youtube youtube = new Youtube();
        
        if (item.getSnippet() != null) {
            YoutubeApiResponse.YoutubeItem.Snippet snippet = item.getSnippet();
            
            youtube.setTitle(snippet.getTitle());
            
            // videoId를 올바르게 가져오기
            String videoId = null;
            if (item.getId() != null) {
                videoId = item.getId().getVideoId();
            }
            
            if (videoId != null) {
                youtube.setUrl("https://www.youtube.com/watch?v=" + videoId);
            }
            
            youtube.setChannelName(snippet.getChannelTitle());
            
            // 썸네일 설정 (고화질 우선)
            if (snippet.getThumbnails() != null) {
                YoutubeApiResponse.YoutubeItem.Snippet.Thumbnails.ThumbnailInfo thumbnail = 
                    snippet.getThumbnails().getHigh() != null ? snippet.getThumbnails().getHigh() :
                    snippet.getThumbnails().getMedium() != null ? snippet.getThumbnails().getMedium() :
                    snippet.getThumbnails().getDefaultThumbnail();
                
                if (thumbnail != null) {
                    youtube.setThumbnail(thumbnail.getUrl());
                }
            }
            
            // 태그 설정
            if (snippet.getTags() != null && !snippet.getTags().isEmpty()) {
                youtube.setTags(String.join(",", snippet.getTags()));
            }
            
            // 업로드 날짜 설정
            if (snippet.getPublishedAt() != null) {
                try {
                    LocalDate uploadDate = LocalDate.parse(
                        snippet.getPublishedAt().substring(0, 10), 
                        DateTimeFormatter.ISO_LOCAL_DATE
                    );
                    youtube.setUploadDate(uploadDate);
                } catch (Exception e) {
                    log.warn("업로드 날짜 파싱 실패: {}", snippet.getPublishedAt());
                }
            }
        }
        
        return youtube;
    }
    
    /**
     * 키워드에서 핵심 검색어 추출
     */
    public String extractSearchKeyword(String productTitle) {
        if (productTitle == null || productTitle.trim().isEmpty()) {
            return "";
        }
        
        // 상품명에서 불필요한 단어 제거
        String keyword = productTitle.trim();
        
        // 숫자와 단위 제거 (예: "1kg", "500g" 등)
        keyword = keyword.replaceAll("\\d+\\s*(kg|g|개|마리|포기|단|박스|팩|봉|통)", "");
        
        // 특수문자 제거
        keyword = keyword.replaceAll("[^가-힣a-zA-Z0-9\\s]", "");
        
        // 연속된 공백 제거
        keyword = keyword.replaceAll("\\s+", " ");
        
        // 고르는법과 세척법 모두 검색
        String chooseKeyword = keyword.trim() + " 고르는법";
        String washKeyword = keyword.trim() + " 세척법";
        
        // 두 키워드를 합쳐서 검색
        keyword = chooseKeyword + " " + washKeyword;
        
        log.info("추출된 검색 키워드: {}", keyword);
        
        return keyword;
    }
    

    
    /**
     * 영상 제목이 검색 키워드와 관련있는지 확인
     */
    private boolean isRelevantVideo(String title) {
        if (title == null || title.trim().isEmpty()) {
            return false;
        }
        
        String lowerTitle = title.toLowerCase();
        
        // 농수산물 관련 키워드들
        String[] foodKeywords = {
            "농산물", "수산물", "축산물", "식품",
            "채소", "과일", "쌀", "곡물", "견과류",
            "고기", "생선", "해산물", "계란", "우유",
            "사과", "배", "오렌지", "바나나", "포도",
            "딸기", "키위", "망고", "파인애플",
            "양파", "마늘", "당근", "감자", "고구마",
            "상추", "배추", "시금치", "부추", "대파",
            "돼지고기", "소고기", "닭고기", "오리고기",
            "고등어", "삼치", "연어", "참치", "새우",
            "조개", "굴", "홍합", "전복", "게",
            "쌀", "보리", "밀", "옥수수", "콩",
            "팥", "녹두", "땅콩", "호두", "아몬드"
        };
        
        // "고르는 방법" 관련 키워드들
        String[] methodKeywords = {
            "고르는 방법", "고르는법", "고르는 법",
            "선택법", "선택 방법", "선택하는법",
            "구입법", "구입 방법", "구매법", "구매 방법",
            "골라보는법", "골라보는 방법",
            "어떻게 고르", "어떻게 선택",
            "팁", "꿀팁", "요령", "비법"
        };
        
        // "세척하는 방법" 관련 키워드들
        String[] washKeywords = {
            "세척법", "세척 방법", "세척하는법",
            "씻는법", "씻는 방법", "씻는법",
            "깨끗이", "깨끗하게", "청소법",
            "세정법", "세정 방법", "세정하는법",
            "물로 씻", "흐르는 물", "소금물",
            "식초", "베이킹소다", "세제"
        };
        
        // 농수산물 키워드가 있는지 확인
        for (String foodKeyword : foodKeywords) {
            if (lowerTitle.contains(foodKeyword)) {
                log.debug("농수산물 키워드 발견: {} in {}", foodKeyword, title);
                return true;
            }
        }
        
        // "고르는 방법" 관련 키워드가 있는지 확인
        for (String methodKeyword : methodKeywords) {
            if (lowerTitle.contains(methodKeyword)) {
                log.debug("고르는 방법 키워드 발견: {} in {}", methodKeyword, title);
                return true;
            }
        }
        
        // "세척하는 방법" 관련 키워드가 있는지 확인
        for (String washKeyword : washKeywords) {
            if (lowerTitle.contains(washKeyword)) {
                log.debug("세척 방법 키워드 발견: {} in {}", washKeyword, title);
                return true;
            }
        }
        
        log.debug("관련 키워드 없음 - 제외: {}", title);
        return false;
    }
} 