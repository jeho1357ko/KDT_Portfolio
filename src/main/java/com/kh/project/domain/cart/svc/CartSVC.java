package com.kh.project.domain.cart.svc;

import java.util.List;

import com.kh.project.domain.entity.Cart;

public interface CartSVC {
  // 장바구니 담기 (cartId 반환)
  Long addOrderInCart (Cart cart);

  //장바구니 전체 조회 (구매자 id로 장바구니 내역 조회 )
  List<Cart> findByBuyerId(Long bid);

  // 장바구니  삭제   리스트 인덱스에는 cid
  int delete(Long cid);

  // 장바구니 주문 선택
  int checkItems(Long cid);

  // 장바구니 주문 선택 취소
  int uncheckItems(Long cid);

  // 장바구니 상품 수량 변경
  int quantityChange (Cart cart);

  //장바구니 초기화
  int clearCart(Long buyerId);

  // 주문 완료된 주문 삭제
  int deleteCheckedItems(Long buyerId);

  // 결제 완료된 상품 삭제 (is_checked = 'Y'인 상품들)
  int deleteCompletedItems(Long buyerId);

  // 중복 체크 - 구매자와 상품으로 기존 장바구니 항목 조회
  boolean isExistInCart(Long buyerId, Long productId);
}
