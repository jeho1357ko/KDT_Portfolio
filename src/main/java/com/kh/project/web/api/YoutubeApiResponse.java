package com.kh.project.web.api;

import java.util.List;

import lombok.Data;

@Data
public class YoutubeApiResponse {
    private String kind;
    private String etag;
    private String nextPageToken;
    private String prevPageToken;
    private PageInfo pageInfo;
    private List<YoutubeItem> items;
    
    @Data
    public static class PageInfo {
        private int totalResults;
        private int resultsPerPage;
    }
    
    @Data
    public static class YoutubeItem {
        private String kind;
        private String etag;
        private VideoId id;  // id가 객체로 되어 있음
        private Snippet snippet;
        
        @Data
        public static class VideoId {
            private String kind;
            private String videoId;  // 실제 비디오 ID
        }
        
        @Data
        public static class Snippet {
            private String publishedAt;
            private String channelId;
            private String title;
            private String description;
            private Thumbnails thumbnails;
            private String channelTitle;
            private List<String> tags;
            private String categoryId;
            private String defaultLanguage;
            private String defaultAudioLanguage;
            
            @Data
            public static class Thumbnails {
                private ThumbnailInfo defaultThumbnail;
                private ThumbnailInfo medium;
                private ThumbnailInfo high;
                private ThumbnailInfo standard;
                private ThumbnailInfo maxres;
                
                @Data
                public static class ThumbnailInfo {
                    private String url;
                    private int width;
                    private int height;
                }
            }
        }
    }
} 