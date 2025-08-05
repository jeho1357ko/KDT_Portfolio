package com.kh.project.domain.entity;

import lombok.Data;

@Data
public class OrderItem {
  private Long orderItemId;         // 주문 상품 아이디
  private Long orderId;             // 주문 아이디
  private Long productId;           // 상품 아이디
  private Long quantity;            // 수량
  private Long unitPrice;           // 단가
  private Long totalPrice;          // 총 가격
  private String deliveryCompany;   // 배송 회사
  private String trackingNumber;    // 송장 번호
}
