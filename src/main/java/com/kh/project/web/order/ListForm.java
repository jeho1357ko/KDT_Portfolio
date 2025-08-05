package com.kh.project.web.order;

import java.util.List;

import com.kh.project.domain.entity.Order;

import lombok.Data;

@Data
public class ListForm {
  public List<Order> list;        // 주문 목록
}
