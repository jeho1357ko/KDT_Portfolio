package com.kh.project.domain.orderItem.svc;

import java.util.List;

import com.kh.project.domain.entity.OrderItem;

public interface OrderItemSVC {
  int saveItem(OrderItem item); // 주문 상세 저장

  List<Integer> saveItems(Long orderId, List<OrderItem> items); // 한번에 상품 저장

  List<OrderItem> findItemsByOrderId(Long orderId); // 주문별 상세 조회 (한 주문에 상품은 여러개)

  int updateItem(OrderItem item); // 주문 상세 수정 (옵션)
  
//  List<OrderItem> findItemsWithProductByOrderId(Long orderId); // 주문별 상세 조회 (상품 정보 포함)
}
