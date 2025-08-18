package com.kh.project.domain.elasticsearch;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.Product;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductSearchSVC {

  final private ProductSearchDAO productSearchDAO;

  public List<Product> search(String keyword, String status, Integer minPrice, Integer maxPrice,String sortScore,String sortDate, int from, int size){
    return productSearchDAO.search(keyword, status,  minPrice, maxPrice, sortScore,sortDate, from, size);
  }

  // 전체 결과 수와 함께 검색하는 메서드
  public ProductSearchDAO.SearchResult searchWithTotal(String keyword, String status, Integer minPrice, Integer maxPrice,String sortScore,String sortDate, int from, int size){
    return productSearchDAO.searchWithTotal(keyword, status,  minPrice, maxPrice, sortScore,sortDate, from, size);
  }

  public void delete(Long productId) throws IOException {
    productSearchDAO.delete(productId);
  }

  public void update(Product product, Long pid) throws IOException{
    productSearchDAO.update(product,pid);
  }
} 