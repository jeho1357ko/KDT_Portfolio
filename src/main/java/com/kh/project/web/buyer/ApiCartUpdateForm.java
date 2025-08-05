package com.kh.project.web.buyer;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ApiCartUpdateForm {
  private Long cartId;            // 장바구니 아이디
  private Long  buyerId;           // 구매자 아이디
  private Long productId;          // 상품 아이디
  private Long quantity;           // 수량
  private LocalDateTime addedAt;   // 추가일
  private char isChecked;          // Y or N
}
