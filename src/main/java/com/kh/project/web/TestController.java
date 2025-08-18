package com.kh.project.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    
    @Value("${youtube.api.key:}")
    private String youtubeApiKey;
    
    @Value("${youtube.api.max-results:5}")
    private int maxResults;
    
    @Value("${youtube.api.region-code:KR}")
    private String regionCode;
    
    /**
     * 환경변수 설정 확인용 엔드포인트
     */
    @GetMapping("/test/env")
    public Map<String, Object> checkEnvironmentVariables() {
        Map<String, Object> result = new HashMap<>();
        
        // YouTube API 설정 확인
        result.put("youtubeApiKeySet", youtubeApiKey != null && !youtubeApiKey.isEmpty());
        result.put("youtubeApiKeyLength", youtubeApiKey != null ? youtubeApiKey.length() : 0);
        result.put("youtubeApiKeyPreview", youtubeApiKey != null && youtubeApiKey.length() > 10 ? 
            youtubeApiKey.substring(0, 10) + "..." : youtubeApiKey);
        result.put("maxResults", maxResults);
        result.put("regionCode", regionCode);
        
        // 시스템 환경변수 확인
        String envApiKey = System.getenv("YOUTUBE_API_KEY");
        result.put("systemEnvApiKeySet", envApiKey != null && !envApiKey.isEmpty());
        result.put("systemEnvApiKeyLength", envApiKey != null ? envApiKey.length() : 0);
        
        return result;
    }
} 