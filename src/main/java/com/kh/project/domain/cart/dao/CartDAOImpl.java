package com.kh.project.domain.cart.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.Cart;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Repository
@Slf4j
@RequiredArgsConstructor
public class CartDAOImpl implements CartDAO{

  private final NamedParameterJdbcTemplate template;

  // 장바구니 담기
  @Override
  public Long addOrderInCart(Cart cart) {
    StringBuffer sql = new StringBuffer();
    sql.append(" INSERT INTO cart ");
    sql.append(" VALUES (cart_cart_id_seq.nextval,:buyerId,:productId,:quantity,SYSTIMESTAMP,'N') ");

    SqlParameterSource param = new BeanPropertySqlParameterSource(cart);

    KeyHolder keyHolder = new GeneratedKeyHolder();

    int i = template.update(sql.toString(), param, keyHolder, new String[]{"cart_id"});

    Number cid = keyHolder.getKey();

    return cid != null ? cid.longValue() : null;
  }

  //장바구니 목록 조회
  @Override
  public List<Cart> findByBuyerId(Long bid) {
    String sql = " SELECT * FROM cart WHERE buyer_id = :bid ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("bid",bid);

    List<Cart> cartList = template.query(sql.toString(), param, BeanPropertyRowMapper.newInstance(Cart.class));

    return cartList;
  }

  // 장바구니 수량 변경
  @Override
  public int quantityChange(Cart cart) {
    String sql = " UPDATE cart SET quantity = :quantity WHERE cart_id = :cartId ";

    SqlParameterSource param = new BeanPropertySqlParameterSource(cart);

    int i = template.update(sql, param);

    return i;
  }

  // 장바구니 주문 선택
  @Override
  public int checkItems(Long cid) {
    String sql = " UPDATE cart SET is_checked = 'Y' WHERE cart_id = :cid ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("cid",cid);

    log.info("Cart checkItems SQL 실행: cartId={}", cid);
    int i = template.update(sql.toString(), param);
    log.info("Cart checkItems 결과: {}행 업데이트됨", i);

    return i;
  }

  // 장바구니 주문 선택 해제
  @Override
  public int uncheckItems(Long cid) {

    String sql = " UPDATE cart SET is_checked = 'N' WHERE cart_id = :cid ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("cid",cid);

    int i = template.update(sql.toString(), param);

    return i;
  }

  // 장바구니 삭제 (개별 하나씩 ) 꼽표 버튼 으로 삭제
  @Override
  public int delete(Long cid) {
    String sql = " DELETE  FROM cart WHERE cart_id = :cid ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("cid",cid);

    int i = template.update(sql.toString(), param);

    return i;
  }



  // 장바구니 초기화
  @Override
  public int clearCart(Long buyerId) {
    String sql = " DELETE  FROM cart WHERE buyer_id = :buyerId ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("buyerId",buyerId);

    int i = template.update(sql.toString(), param);

    return i;
  }

  // 주문 완료된 주문 삭제
  @Override
  public int deleteCheckedItems(Long buyerId) {
    String sql = " DELETE FROM cart WHERE buyer_id = :buyerId AND is_checked = 'Y' ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("buyerId",buyerId);

    int i = template.update(sql.toString(), param);

    return i;
  }

  // 결제 완료된 상품 삭제 (is_checked = 'Y'인 상품들)
  @Override
  public int deleteCompletedItems(Long buyerId) {
    String sql = " DELETE FROM cart WHERE buyer_id = :buyerId AND is_checked = 'Y' ";

    SqlParameterSource param = new MapSqlParameterSource().addValue("buyerId", buyerId);

    log.info("결제 완료된 상품 삭제 SQL 실행: buyerId={}", buyerId);
    int deletedCount = template.update(sql.toString(), param);
    log.info("결제 완료된 상품 삭제 결과: {}개 상품 삭제됨", deletedCount);

    return deletedCount;
  }

  // 중복 체크 - 구매자와 상품으로 기존 장바구니 항목 조회 (is_checked가 'Y'가 아닌 것만)
  @Override
  public Optional<Cart> findByBuyerIdAndProductId(Long buyerId, Long productId) {
    String sql = " SELECT * FROM cart WHERE buyer_id = :buyerId AND product_id = :productId AND is_checked != 'Y' ";
    
    SqlParameterSource param = new MapSqlParameterSource()
        .addValue("buyerId", buyerId)
        .addValue("productId", productId);
    
    log.info("중복 체크 SQL 실행: buyerId={}, productId={}", buyerId, productId);
    List<Cart> result = template.query(sql, param, BeanPropertyRowMapper.newInstance(Cart.class));
    log.info("중복 체크 SQL 결과: {}개 항목 발견", result.size());
    
    return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
  }

}
