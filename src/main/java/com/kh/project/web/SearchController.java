package com.kh.project.web;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.project.domain.elasticsearch.ProductSearchDAO;
import com.kh.project.domain.elasticsearch.ProductSearchSVC;
import com.kh.project.domain.elasticsearch.YoutubeSearchSVC;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.entity.Youtube;
import com.kh.project.domain.svc.YoutubeApiService;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import com.kh.project.web.api.SearchDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/products")
public class SearchController {
  final private ProductSearchSVC productSearchSVC;
  final private YoutubeSearchSVC youtubeSearchSVC;
  final private YoutubeApiService youtubeApiService;

  @GetMapping("/search")
  public ApiResponse<SearchDTO> search(
      @RequestParam(value = "keyword") String keyword,
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "minPrice", required = false) Integer minPrice,
      @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
      @RequestParam(value = "from", defaultValue = "0") int from,
      @RequestParam(value = "size", defaultValue = "20") int size,
      @RequestParam(value = "sortScore", required = false) String sortScore,
      @RequestParam(value = "sortDate", required = false) String sortDate
  ) {
    // 전체 결과 수와 함께 검색
    ProductSearchDAO.SearchResult searchResult = productSearchSVC.searchWithTotal(keyword, status, minPrice, maxPrice, sortScore, sortDate, from, size);
    List<Product> products = searchResult.getProducts();
    long totalCount = searchResult.getTotalCount();
    
    // YouTube API를 통한 자동 검색
    List<Youtube> youtubeList = new ArrayList<>();
    try {
      // 키워드에서 핵심 검색어 추출
      String searchKeyword = youtubeApiService.extractSearchKeyword(keyword);
      if (!searchKeyword.isEmpty()) {
        log.info("YouTube 검색 시작 - 키워드: {}", searchKeyword);
        youtubeList = youtubeApiService.searchYoutubeVideos(searchKeyword);
        log.info("YouTube 검색 완료: {}개 영상", youtubeList.size());
      }
    } catch (Exception e) {
      log.error("YouTube 검색 중 오류: {}", e.getMessage(), e);
      // YouTube 검색 실패 시 기존 방식 사용
      youtubeList = youtubeSearchSVC.search(keyword, from, size);
    }
    
    SearchDTO searchDTO = new SearchDTO();
    searchDTO.setProducts(products);
    searchDTO.setYoutubeList(youtubeList);
    searchDTO.setTotalCount(totalCount);
    return ApiResponse.of(ApiResponseCode.SUCCESS,searchDTO);
  }
} 