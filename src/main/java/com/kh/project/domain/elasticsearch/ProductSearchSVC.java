package com.kh.project.domain.elasticsearch;

import com.kh.project.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductSearchSVC {

  final private ProductSearchDAO productSearchDAO;

  public List<Product> search(String keyword, String status, Integer minPrice, Integer maxPrice,String sortScore,String sortDate, int from, int size){
    return productSearchDAO.search(keyword, status,  minPrice, maxPrice, sortScore,sortDate, from, size);
  }

  public void delete(Long productId) throws IOException {
    productSearchDAO.delete(productId);
  }

  public void update(Product product, Long pid) throws IOException{
    productSearchDAO.update(product,pid);
  }
} 