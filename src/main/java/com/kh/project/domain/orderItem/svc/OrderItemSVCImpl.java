package com.kh.project.domain.orderItem.svc;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.OrderItem;
import com.kh.project.domain.orderItem.dao.OrderItemDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderItemSVCImpl implements OrderItemSVC{

  final private OrderItemDAO orderItemDAO;

  // 주문 상품 저장
  @Override
  public int saveItem(OrderItem item) {
    return orderItemDAO.saveItem(item);
  }

  // 주문 상품 목록 저장
  @Override
  public List<Integer> saveItems(Long orderId, List<OrderItem> items) {
    return orderItemDAO.saveItems(orderId, items);
  }

  // 주문 상품 목록 조회
  @Override
  public List<OrderItem> findItemsByOrderId(Long orderId) {
    return orderItemDAO.findItemsByOrderId(orderId);
  }

  // 주문 상품 수정
  @Override
  public int updateItem(OrderItem item) {
    return orderItemDAO.updateItem(item);
  }
}
