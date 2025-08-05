package com.kh.project.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class Order {
  private Long orderId;            // 주문 아이디
  private Long buyerId;             // 구매자 아이디
  private Long orderNumber;         // 주문 번호
  private String name;              // 수령자 명
  private String tel;               // 전화번호
  private String deliveryAddress;   // 배송 주소
  private LocalDateTime orderDate;  // 주문 일시
  private String orderStatus; // '결제실패','결제완료','배송중','배송완료','주문취소'
}
