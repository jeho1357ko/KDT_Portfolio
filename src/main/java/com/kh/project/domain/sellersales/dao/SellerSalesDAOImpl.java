package com.kh.project.domain.sellersales.dao;

import java.util.List;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.SellerSales;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Repository
public class SellerSalesDAOImpl implements SellerSalesDAO {

  private final NamedParameterJdbcTemplate template;

  // 주문 건수 조회
  @Override
  public SellerSales totalOrder(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT p.seller_id, COUNT(DISTINCT bo.order_id) AS completed_order_count ");
    sql.append(" FROM product p JOIN order_item oi ON p.product_id = oi.product_id ");
    sql.append(" JOIN buyer_order bo ON oi.order_id = bo.order_id ");
    sql.append(" WHERE bo.order_status = '결제완료' ");
    sql.append(" AND p.seller_id = :sellerId GROUP BY p.seller_id ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sellerId", sellerId);

    try {
      return template.queryForObject(sql.toString(), param, BeanPropertyRowMapper.newInstance(SellerSales.class));
    } catch (EmptyResultDataAccessException e) {
      log.warn("주문 건수 결과 없음 - sellerId: {}", sellerId);
      SellerSales empty = new SellerSales();
      empty.setCompletedOrderCount(0L);
      return empty;
    }
  }

  // 판매 금액 조회
  @Override
  public SellerSales totalPrice(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT p.seller_id, SUM(oi.total_price) AS total_sales_amount ");
    sql.append(" FROM product p JOIN order_item oi ON p.product_id = oi.product_id ");
    sql.append(" JOIN buyer_order bo ON oi.order_id = bo.order_id ");
    sql.append(" WHERE p.seller_id = :sellerId AND bo.order_status = '결제완료' ");
    sql.append(" GROUP BY p.seller_id ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sellerId", sellerId);

    try {
      return template.queryForObject(sql.toString(), param, BeanPropertyRowMapper.newInstance(SellerSales.class));
    } catch (EmptyResultDataAccessException e) {
      log.warn("판매 금액 결과 없음 - sellerId: {}", sellerId);
      SellerSales empty = new SellerSales();
      empty.setTotalSalesAmount(0L);
      return empty;
    }
  }

  // 주문 건수 상위 3개 조회
  @Override
  public List<SellerSales> top3Order(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append("SELECT * FROM (SELECT p.product_id, p.title AS product_title, COUNT(oi.order_item_id) AS order_count ");
    sql.append("FROM product p JOIN order_item oi ON p.product_id = oi.product_id ");
    sql.append("JOIN buyer_order bo ON oi.order_id = bo.order_id ");
    sql.append("WHERE p.seller_id = :sellerId AND bo.order_status = '결제완료' ");
    sql.append("GROUP BY p.product_id, p.title ORDER BY order_count DESC) ");
    sql.append("WHERE ROWNUM <= 3 ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sellerId", sellerId);

    return template.query(sql.toString(), param, BeanPropertyRowMapper.newInstance(SellerSales.class));
  }

  // 판매 금액 상위 3개 조회
  @Override
  public List<SellerSales> top3Price(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT * FROM ( SELECT p.product_id, p.title AS product_title, SUM(oi.total_price) AS total_sales_amount ");
    sql.append(" FROM product p JOIN order_item oi ON p.product_id = oi.product_id ");
    sql.append(" JOIN buyer_order bo ON oi.order_id = bo.order_id ");
    sql.append(" WHERE p.seller_id = :sellerId AND bo.order_status = '결제완료' ");
    sql.append(" GROUP BY p.product_id, p.title ORDER BY total_sales_amount DESC ) ");
    sql.append(" WHERE ROWNUM <= 3 ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sellerId", sellerId);

    return template.query(sql.toString(), param, BeanPropertyRowMapper.newInstance(SellerSales.class));
  }
}