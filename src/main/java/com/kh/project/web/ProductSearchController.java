package com.kh.project.web;

import com.kh.project.domain.elasticsearch.ProductSearchSVC;
import com.kh.project.domain.entity.Product;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/products")
public class ProductSearchController {
  final private ProductSearchSVC productSearchSVC;

  @GetMapping("/search")
  public ApiResponse<List<Product>> search(
      @RequestParam String keyword,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer minPrice,
      @RequestParam(required = false) Integer maxPrice,
      @RequestParam(defaultValue = "0") int from,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String sortScore,
      @RequestParam(required = false) String sortDate
  ) {
    List<Product> products = productSearchSVC.search(keyword, status,  minPrice, maxPrice, sortScore,sortDate, from, size);
    return ApiResponse.of(ApiResponseCode.SUCCESS, products);
  }
} 