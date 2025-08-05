package com.kh.project.domain.order.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.Order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Repository
@Slf4j
@RequiredArgsConstructor
public class OrderDAOImpl implements OrderDAO {

  final private NamedParameterJdbcTemplate template;

  // 주문 저장
  @Override
  public Long saveOrder(Order order) {
    StringBuffer sql = new StringBuffer();
    sql.append(" INSERT INTO buyer_order (order_id, buyer_id, order_number,name, tel, delivery_address, order_date, order_status) ");
    sql.append(" VALUES (buyer_order_buyer_order_id_seq.nextval,:buyerId,buyer_order_order_number_seq.nextval, ");
    sql.append(" :name,:tel,:deliveryAddress,systimestamp,:orderStatus) ");

    SqlParameterSource param = new BeanPropertySqlParameterSource(order);

    KeyHolder keyHolder = new GeneratedKeyHolder();

    int i = template.update(sql.toString(), param, keyHolder, new String[]{"order_id"});

    Number key = keyHolder.getKey();

    return key != null ? key.longValue() : null;
  }

  // 주문 조회
  @Override
  public Optional<Order> findById(Long orderId) {
    String sql = " SELECT * FROM buyer_order WHERE order_id = :orderId ";
    SqlParameterSource param = new MapSqlParameterSource().addValue("orderId", orderId);

    try {
      Order order = template.queryForObject(sql, param, BeanPropertyRowMapper.newInstance(Order.class));
      return Optional.of(order);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  // 주문 목록 조회
  @Override
  public List<Order> findByIds(Long buyerId) {
    String sql = " select * from buyer_order where buyer_id = :buyerId ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("buyerId",buyerId);

    List<Order> orderList = template.query(sql.toString(), param, BeanPropertyRowMapper.newInstance(Order.class));

    return orderList;
  }

  // 주문 수정
  @Override
  public int updateOrder(Order order) {
    String sql = " UPDATE buyer_order SET name = :name,tel = :tel,delivery_address = :deliveryAddress WHERE order_id = :orderId ";
    SqlParameterSource param = new BeanPropertySqlParameterSource(order);
    int i = template.update(sql.toString(), param);

    return i;
  }

  // 주문 상태 수정
  @Override
  public int updateStatus(Order order) {
    String sql = " UPDATE buyer_order SET order_status = :orderStatus where order_id = :orderId ";
    SqlParameterSource param = new BeanPropertySqlParameterSource(order);
    int i = template.update(sql.toString(), param);

    return i;
  }


}
