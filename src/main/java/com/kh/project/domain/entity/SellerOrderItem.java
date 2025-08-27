package com.kh.project.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SellerOrderItem {
  private Long sellerId;           // 판매자 아이디
  private Long orderId;            // 주문 아이디
  private Long orderNumber;        // 주문 번호
  private LocalDateTime orderDate; // 주문 일시
  private String orderStatus;      // 주문 상태
  private Long orderItemId;        // 주문 상품 아이디
  private Long productId;          // 상품 아이디
  private String productTitle;     // 상품 제목
  private Long quantity;           // 수량
  private Long unitPrice;          // 단가
  private Long totalPrice;         // 총 가격
} 