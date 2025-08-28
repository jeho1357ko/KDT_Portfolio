package com.kh.project.domain.product.svc;

import java.util.List;
import java.util.Optional;

import com.kh.project.domain.entity.Product;

public interface ProductSVC {
  // 등록
  Long saveProduct(Product product, Long sid);

  // 조회
  Optional<Product> findById(Long pid);//pid = product id

  // 단체 조회
  List<Product> findByIds(Long sid);

  // 수정
  int updateById(Long pid , Product product);

  // 삭제(단건)
  int deleteById(Long pid);

  //선택 일괄 삭제
  int deleteByIds(List<Long> list);

  // 홈 판매글 조회
  List<Product> allProduct();

  // 판매자 ID로 상품들 비활성화
  int deactivateBySellerId(Long sellerId);
  
  // 매칭 가능한 상품명 검색
  List<String> findMatchingProductNames(String searchTerm);
  
  // 재고 차감 (재고가 충분한 경우에만 차감)
  boolean decreaseQuantity(Long productId, Long quantity);

}


