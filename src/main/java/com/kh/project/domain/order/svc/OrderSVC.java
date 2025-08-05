package com.kh.project.domain.order.svc;

import com.kh.project.domain.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderSVC {
  // 주문 하기
  Long saveOrder(Order order);
  // 주문 조회 개별
  Optional<Order> findById(Long orderId);
  // 주문 전체 조회
  List<Order> findByIds(Long buyerId);
  // 주문 수정
  int updateOrder(Order order);
  // 주문 상태 변경
  int updateStatus(Order order);
}
