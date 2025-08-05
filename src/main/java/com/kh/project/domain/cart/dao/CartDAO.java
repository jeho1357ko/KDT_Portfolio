package com.kh.project.domain.cart.dao;

import java.util.List;
import java.util.Optional;

import com.kh.project.domain.entity.Cart;

public interface CartDAO {

  // 장바구니 담기
  Long addOrderInCart(Cart cart);

  // 장바구니 목록 조회
  List<Cart> findByBuyerId(Long bid);

  // 장바구니 수량 변경
  int quantityChange(Cart cart);

  // 장바구니 주문 선택
  int checkItems(Long cid);

  // 장바구니 주문 선택 해제
  int uncheckItems(Long cid);

  // 장바구니 삭제 (개별 하나씩 ) 꼽표 버튼 으로 삭제
  int delete(Long cid);

  // 장바구니 초기화
  int clearCart(Long buyerId);

  // 주문 완료된 주문 삭제
  int deleteCheckedItems(Long buyerId);

  // 결제 완료된 상품 삭제 (is_checked = 'Y'인 상품들)
  int deleteCompletedItems(Long buyerId);

  // 중복 체크 - 구매자와 상품으로 기존 장바구니 항목 조회
  Optional<Cart> findByBuyerIdAndProductId(Long buyerId, Long productId);

}
