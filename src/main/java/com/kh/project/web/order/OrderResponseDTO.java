package com.kh.project.web.order;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class OrderResponseDTO {
  private Long orderId;            // 주문 아이디
  private Long orderNumber;        // 주문 번호
  private LocalDateTime orderDate; // 주문 일시
  private String orderStatus;      // 주문 상태
  private Long totalPrice;         // 총 가격

}
