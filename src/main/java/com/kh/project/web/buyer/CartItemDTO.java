package com.kh.project.web.buyer;

import lombok.Data;

@Data
public class CartItemDTO {
  private Long cartId;            // 장바구니 아이디
  private Long productId;          // 상품 아이디
  private Long quantity;           // 수량
  private String isChecked;        // 주문 선택 여부 (Y/N)

  // Product 정보 포함
  private String productTitle;     // 상품 제목
  private String productThumbnail; // 상품 썸네일 'url'
  private Long productPrice;       // 상품 가격
  private Long deliveryFee;        // 배송비
}
