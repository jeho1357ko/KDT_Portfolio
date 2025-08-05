package com.kh.project.domain.order.svc;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.Order;
import com.kh.project.domain.order.dao.OrderDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderSVCImpl implements OrderSVC {
  final private OrderDAO orderDAO;

  // 주문 저장
  @Override
  public Long saveOrder(Order order) {
    return orderDAO.saveOrder(order);
  }

  // 주문 조회
  @Override
  public Optional<Order> findById(Long orderId) {
    return orderDAO.findById(orderId);
  }

  // 주문 목록 조회
  @Override
  public List<Order> findByIds(Long buyerId) {
    return orderDAO.findByIds(buyerId);
  }

  // 주문 수정
  @Override
  public int updateOrder(Order order) {
    return orderDAO.updateOrder(order);
  }

  // 주문 상태 수정
  @Override
  public int updateStatus(Order order) {
    return orderDAO.updateStatus(order);
  }
}
