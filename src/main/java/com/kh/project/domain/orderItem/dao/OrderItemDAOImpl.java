package com.kh.project.domain.orderItem.dao;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.OrderItem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OrderItemDAOImpl implements OrderItemDAO{

  final private NamedParameterJdbcTemplate template;

  // 주문 상품 저장
  @Override
  public int saveItem(OrderItem item) {
    StringBuffer sql = new StringBuffer();
        sql.append(" INSERT INTO order_item (order_item_id, order_id, product_id, quantity, unit_price, total_price, delivery_company, tracking_number) ");
        sql.append(" VALUES (order_item_order_item_id_seq.nextval,:orderId,:productId,:quantity,:unitPrice,:totalPrice,:deliveryCompany,:trackingNumber) ");
    SqlParameterSource param = new BeanPropertySqlParameterSource(item);
    int i = template.update(sql.toString(), param);
    return i;
  }

  // 주문 상품 목록 저장
  @Override
  public List<Integer> saveItems(Long orderId, List<OrderItem> items) {
    String sql = """
    INSERT INTO order_item (
      order_item_id, order_id, product_id,
      quantity, unit_price, total_price,
      delivery_company, tracking_number
    )
    VALUES (
      order_item_order_item_id_seq.nextval, :orderId, :productId,
      :quantity, :unitPrice, :totalPrice,
      :deliveryCompany, :trackingNumber
    )
  """;

    // orderId를 각 OrderItem에 세팅
    for (OrderItem item : items) {
      item.setOrderId(orderId);
    }

    // 각각의 OrderItem을 SqlParameterSource 배열로 변환
    SqlParameterSource[] params = items.stream()
        .map(BeanPropertySqlParameterSource::new)
        .toArray(SqlParameterSource[]::new);

    // batch update 실행
    int[] result = template.batchUpdate(sql, params);

    // 결과를 List<Integer>로 변환해서 반환
    return Arrays.stream(result)
        .boxed()
        .collect(Collectors.toList());
  }

  // 주문 상품 목록 조회
  @Override
  public List<OrderItem> findItemsByOrderId(Long orderId) {
    String sql = " select * from order_item where order_id = :orderId";
    SqlParameterSource param = new MapSqlParameterSource().addValue("orderId",orderId);
    List<OrderItem> itemList = template.query(sql.toString(), param, BeanPropertyRowMapper.newInstance(OrderItem.class));
    return itemList;
  }

  // 주문 상품 수정
  @Override
  public int updateItem(OrderItem item) {
// 1. 수량 변경
    String sql1 = "UPDATE order_item SET quantity = :quantity WHERE order_item_id = :orderItemId";
    SqlParameterSource param1 = new MapSqlParameterSource()
        .addValue("quantity", item.getQuantity())
        .addValue("orderItemId", item.getOrderItemId());
    int updated1 = template.update(sql1, param1);

    // 2. total_price = quantity * unit_price
    String sql2 = "UPDATE order_item SET total_price = quantity * unit_price WHERE order_item_id = :orderItemId";
    SqlParameterSource param2 = new MapSqlParameterSource()
        .addValue("orderItemId", item.getOrderItemId());
    int updated2 = template.update(sql2, param2);

    // 둘 다 성공하면 2, 하나라도 실패하면 해당 row 수 반환
    return updated1 + updated2;

  }
}
