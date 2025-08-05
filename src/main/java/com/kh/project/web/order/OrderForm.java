package com.kh.project.web.order;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.project.domain.entity.OrderItem;

import lombok.Data;

@Data
public class OrderForm {
  private Long orderId;            // 주문 아이디
  private Long buyerId;            // 구매자 아이디
  private Long orderNumber;        // 주문 번호
  private String name; // 수령자 명
  private String tel;              // 전화번호
  private String deliveryAddress;  // 배송 주소
  private LocalDateTime orderDate; // 주문 일시
  private String orderStatus;      // 주문 상태
  private Long totalPrice;         // 총 가격
  private List<OrderItem> items;   // 주문 상품 목록

}
