package com.kh.project.web;

import java.util.List;

import com.kh.project.domain.elasticsearch.YoutubeSearchSVC;
import com.kh.project.domain.entity.Youtube;
import com.kh.project.web.api.SearchDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.project.domain.elasticsearch.ProductSearchSVC;
import com.kh.project.domain.entity.Product;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/products")
public class SearchController {
  final private ProductSearchSVC productSearchSVC;
  final private YoutubeSearchSVC youtubeSearchSVC;

  @GetMapping("/search")
  public ApiResponse<SearchDTO> search(
      @RequestParam(value = "keyword") String keyword,
      @RequestParam(value = "status", required = false) String status,
      @RequestParam(value = "minPrice", required = false) Integer minPrice,
      @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
      @RequestParam(value = "from", defaultValue = "0") int from,
      @RequestParam(value = "size", defaultValue = "10") int size,
      @RequestParam(value = "sortScore", required = false) String sortScore,
      @RequestParam(value = "sortDate", required = false) String sortDate
  ) {
    List<Product> products = productSearchSVC.search(keyword, status,  minPrice, maxPrice, sortScore,sortDate, from, size);
    List<Youtube> youtubeList = youtubeSearchSVC.search(keyword, from, size);
    SearchDTO searchDTO = new SearchDTO();
    searchDTO.setProducts(products);
    searchDTO.setYoutubeList(youtubeList);
    return ApiResponse.of(ApiResponseCode.SUCCESS,searchDTO);
  }
} 