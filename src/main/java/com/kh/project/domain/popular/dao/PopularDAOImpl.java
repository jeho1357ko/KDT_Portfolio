package com.kh.project.domain.popular.dao;

import com.kh.project.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PopularDAOImpl implements PopularDAO {

  private final NamedParameterJdbcTemplate template;

  private RowMapper<Product> productRowMapper() {
    return (rs, rowNum) -> {
      Product product = new Product();
      product.setProductId(rs.getLong("product_id"));
      product.setSellerId(rs.getLong("seller_id"));
      product.setTitle(rs.getString("title"));
      product.setContent(rs.getString("content"));
      product.setPrice(rs.getLong("price"));
      product.setQuantity(rs.getLong("quantity"));
      product.setThumbnail(rs.getString("thumbnail"));
      product.setStatus(rs.getString("status"));
      product.setProductName(rs.getString("product_name"));
      product.setDeliveryFee(rs.getLong("delivery_fee"));
      product.setDeliveryInformation(rs.getString("delivery_information"));
      product.setDeliveryMethod(rs.getString("delivery_method"));
      product.setCountryOfOrigin(rs.getString("country_of_origin"));
      
      Timestamp cdate = rs.getTimestamp("cdate");
      if (cdate != null) {
        product.setCdate(cdate.toString());
      }
      
      Timestamp udate = rs.getTimestamp("udate");
      if (udate != null) {
        product.setUdate(udate.toString());
      }
      
      return product;
    };
  }

  @Override
  public List<Product> findTopPopularProducts(int limit) {
    StringBuilder sql = new StringBuilder();
    sql.append("SELECT * FROM ( ");
    sql.append("  SELECT p.product_id, p.seller_id, p.title, p.content, p.price, p.quantity, p.thumbnail, p.status, ");
    sql.append("         p.product_name, p.delivery_fee, p.delivery_information, p.delivery_method, p.country_of_origin, p.cdate, p.udate, ");
    sql.append("         NVL(sales_cnt, 0) AS total_sales ");
    sql.append("  FROM product p ");
    sql.append("  LEFT JOIN ( ");
    sql.append("    SELECT oi.product_id, SUM(oi.quantity) AS sales_cnt ");
    sql.append("    FROM order_item oi ");
    sql.append("    JOIN buyer_order bo ON oi.order_id = bo.order_id ");
    sql.append("    WHERE bo.order_status = '결제완료' ");
    sql.append("    GROUP BY oi.product_id ");
    sql.append("  ) s ON p.product_id = s.product_id ");
    sql.append("  WHERE p.status != '비활성화' ");
    sql.append(") ORDER BY total_sales DESC, cdate DESC ");
    sql.append("FETCH FIRST :limit ROWS ONLY");

    SqlParameterSource param = new MapSqlParameterSource()
        .addValue("limit", limit);

    return template.query(sql.toString(), param, productRowMapper());
  }
}
