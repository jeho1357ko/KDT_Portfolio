package com.kh.project.domain.product.dao;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.Product;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Repository
@Slf4j
public class ProductDAOImpl implements ProductDAO{


  private final NamedParameterJdbcTemplate template;

  /**
   * 등록
   * @param product
   * @return pid 게시글 아이디
   */
  @Override  //sid = seller id
  public Long saveProduct(Product product , Long sid) {
    StringBuffer sql = new StringBuffer();
    sql.append(" INSERT INTO product(product_id,seller_id,title,content,price,quantity,thumbnail,status, ");
    sql.append(" product_name,delivery_fee,delivery_information,delivery_method,country_of_origin,cdate,udate) ");
    sql.append(" VALUES(product_product_id.NEXTVAL,:sid,:title,:content,:price,:quantity,:thumbnail,:status, ");
    sql.append(":productName,:deliveryFee,:deliveryInformation,:deliveryMethod,:countryOfOrigin,SYSTIMESTAMP,SYSTIMESTAMP) ");


    MapSqlParameterSource param = new MapSqlParameterSource();

    param.addValue("sid", sid);
    param.addValue("title", product.getTitle());
    param.addValue("content", product.getContent());
    param.addValue("price", product.getPrice());
    param.addValue("quantity", product.getQuantity());
    param.addValue("thumbnail", product.getThumbnail());
    param.addValue("status", product.getStatus());
    param.addValue("productName", product.getProductName());
    param.addValue("deliveryFee", product.getDeliveryFee());
    param.addValue("deliveryInformation", product.getDeliveryInformation());
    param.addValue("deliveryMethod", product.getDeliveryMethod());
    param.addValue("countryOfOrigin", product.getCountryOfOrigin());


    KeyHolder keyHolder = new GeneratedKeyHolder();

    int row = template.update(sql.toString(), param, keyHolder, new String[]{"product_id"});

    Number pid = (Number) keyHolder.getKey();

    return pid != null ? pid.longValue() : null;
  }



  RowMapper<Product> productRowMapper(){
    return (rs, rowNum) -> {
      Product product = new Product();
      product.setProductId(rs.getLong("product_id"));
      product.setContent(rs.getString("content"));
      product.setPrice(rs.getLong("price"));
      product.setQuantity(rs.getLong("quantity"));
      product.setTitle(rs.getString("title"));
      product.setStatus(rs.getString("status"));
      product.setThumbnail(rs.getString("thumbnail"));
      product.setSellerId(rs.getLong("seller_id"));
      Timestamp cdate = rs.getTimestamp("cdate");
      Timestamp udate = rs.getTimestamp("udate");
      product.setCdate(cdate != null ? cdate.toLocalDateTime().toString() : null);
      product.setUdate(udate != null ? udate.toLocalDateTime().toString() : null);
      product.setProductName(rs.getString("product_name"));
      product.setDeliveryFee(rs.getLong("delivery_fee"));
      product.setDeliveryInformation(rs.getString("delivery_information"));
      product.setDeliveryMethod(rs.getString("delivery_method"));
      product.setCountryOfOrigin(rs.getString("country_of_origin"));
      return product;
    };
  }
  /**
   * 조회 (전체)
   * @param sid 상품 게시글 번호 seller_id
   * @return List<Product> 리스트
   */
  @Override
  public List<Product> findByIds(Long sid) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT product_id,seller_id,title,content,price,quantity,thumbnail,status, product_name, delivery_fee, delivery_information, delivery_method, country_of_origin,cdate,udate ");
    sql.append(" FROM product where seller_id = :sid AND status != '비활성화' ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sid",sid);

    List<Product> All = template.query(sql.toString(),param,productRowMapper());

    return All;
  }

  /**
   * 조회 단건
   * @param pid = product_id
   * @return Optional<Product>
   */
  @Override
  public Optional<Product> findById(Long pid) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT product_id,seller_id,title,content,price,quantity,thumbnail,status,product_name, delivery_fee, delivery_information, delivery_method, country_of_origin,cdate,udate ");
    sql.append(" FROM product WHERE product_id = :pid ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("pid",pid);

    try {
      Product product = template.queryForObject(sql.toString(), param, productRowMapper());
      return Optional.ofNullable(product);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  /**
   * 수정
   * @param pid
   * @param product
   * @return
   */
  @Override
  public int updateById(Long pid, Product product) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET ");
    sql.append(" title = :title, content = :content, ");
    sql.append(" price = :price, quantity = :quantity , thumbnail = :thumbnail, ");
    sql.append(" status = :status, ");
    sql.append(" product_name = :productName, delivery_fee = :deliveryFee, ");
    sql.append(" delivery_information = :deliveryInformation, delivery_method = :deliveryMethod, ");
    sql.append(" country_of_origin = :countryOfOrigin, ");
    sql.append(" udate = systimestamp ");
    sql.append("WHERE product_id = :pid");

    MapSqlParameterSource param = new MapSqlParameterSource();

    param.addValue("pid",pid);
    param.addValue("title",product.getTitle());
    param.addValue("content",product.getContent());
    param.addValue("quantity",product.getQuantity());
    param.addValue("thumbnail",product.getThumbnail());
    param.addValue("price",product.getPrice());
    param.addValue("status",product.getStatus());
    param.addValue("productName", product.getProductName());
    param.addValue("deliveryFee", product.getDeliveryFee());
    param.addValue("deliveryInformation", product.getDeliveryInformation());
    param.addValue("deliveryMethod", product.getDeliveryMethod());
    param.addValue("countryOfOrigin", product.getCountryOfOrigin());

    int row = template.update(sql.toString(), param);

    return row;
  }

  /**
   * 단건 삭제
   * @param pid
   * @return
   */
  @Override
  public int deleteById(Long pid) {
  StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET status = '비활성화' ");
    sql.append(" WHERE product_id = :pid  ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("pid",pid);

    int i = template.update(sql.toString(), param);
    return i;
  }

  /**
   * 선택 일괄 비활성화
   * @param list
   * @return
   */
  @Override
  public int deleteByIds(List<Long> list) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET status = '비활성화' ");
    sql.append(" WHERE product_id in (:list) ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("list",list);

    int i = template.update(sql.toString(), param);
    return i;
  }

  /**
   * 상품 목록 조회 (비활성화 제외)
   * @return List<Product>
   */
  @Override
  public List<Product> allProduct() {
    String sql = " select * from product WHERE status != '비활성화' ORDER BY cdate DESC ";
    SqlParameterSource param = new MapSqlParameterSource();
    List<Product> productList = template.query(sql.toString(), param, productRowMapper());

    return productList;
  }

  /**
   * 판매자 ID로 상품들 비활성화
   * @param sellerId 판매자 ID
   * @return 업데이트된 행 수
   */
  @Override
  public int deactivateBySellerId(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET status = '비활성화' ");
    sql.append(" WHERE seller_id = :sellerId ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sellerId", sellerId);

    int i = template.update(sql.toString(), param);
    return i;
  }
  
  /**
   * 재고 차감 (재고가 충분한지 조건부로 차감)
   * @param productId 상품 ID
   * @param quantity 차감할 수량
   * @return 1이면 성공, 0이면 재고 부족/미차감
   */
  @Override
  public int decreaseQuantity(Long productId, Long quantity) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET ");
    sql.append(" quantity = quantity - :quantity, ");
    sql.append(" udate = SYSTIMESTAMP ");
    sql.append(" WHERE product_id = :productId ");
    sql.append(" AND status = '판매중' ");
    sql.append(" AND quantity >= :quantity ");

    MapSqlParameterSource param = new MapSqlParameterSource();
    param.addValue("productId", productId);
    param.addValue("quantity", quantity);

    int updated = template.update(sql.toString(), param);

    if (updated > 0) {
      updateStatusIfOutOfStock(productId);
    }

    return updated;
  }

  /**
   * 재고가 0이면 상태를 '재고소진'으로 변경
   */
  private void updateStatusIfOutOfStock(Long productId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE product SET ");
    sql.append(" status = '재고소진', ");
    sql.append(" udate = SYSTIMESTAMP ");
    sql.append(" WHERE product_id = :productId ");
    sql.append(" AND quantity = 0 ");
    sql.append(" AND status = '판매중' ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("productId", productId);
    template.update(sql.toString(), param);
  }
}
