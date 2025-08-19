package com.kh.project.domain.review.dao;

import co.elastic.clients.elasticsearch.xpack.usage.Sql;
import com.kh.project.domain.entity.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ReviewDAOImpl implements ReviewDAO{

  private final NamedParameterJdbcTemplate template;

  // 공통 매퍼
  private RowMapper<Review> reviewRowMapper = new RowMapper<Review>() {
    @Override
    public Review mapRow(ResultSet rs, int rowNum) throws SQLException {
      Review r = new Review();
      r.setReviewId(rs.getLong("review_id"));
      r.setBuyerId(getNullableLong(rs, "buyer_id"));
      r.setOrderId(getNullableLong(rs, "order_id"));
      r.setOrderItemId(getNullableLong(rs, "order_item_id"));
      r.setProductId(rs.getLong("product_id"));
      r.setTitle(rs.getString("title"));
      r.setContent(rs.getString("content"));
      r.setScore(rs.getLong("score"));
      // BLOB -> byte[]
      byte[] pic = rs.getBytes("pic");
      r.setPic(pic);

      Timestamp cts = rs.getTimestamp("cdate");
      Timestamp uts = rs.getTimestamp("udate");
      r.setCdate(cts != null ? cts.toLocalDateTime() : null);
      r.setUdate(uts != null ? uts.toLocalDateTime() : null);
      return r;
    }

    private Long getNullableLong(ResultSet rs, String col) throws SQLException {
      long v = rs.getLong(col);
      return rs.wasNull() ? null : v;
    }
  };

  // 등록
  @Override
  public Long save(Review review) {
    // Oracle: 시퀀스 쓰는 경우
    //   review_id 는 review_seq.nextval 사용
    //   만약 AUTO INCREMENT/IDENTITY면 아래 RETURNING 대신 KeyHolder or SimpleJdbcInsert 쓰면 됨.
    String sql =
        "insert into review (" +
            " review_id, buyer_id, order_id, order_item_id ,product_id, title, content, pic,score, cdate, udate" +
            ") values (" +
            " review_review_id_seq.nextval, :buyerId, :orderId, :orderItemId, :productId,:title, :content, :pic,:score ,systimestamp, systimestamp" +
            ")";
    SqlParameterSource param = new BeanPropertySqlParameterSource(review);
    KeyHolder keyHolder = new GeneratedKeyHolder();

    //
    int updated = template.update(sql,param, keyHolder, new String[]{"review_id"}
    );

    if (updated == 0) throw new IllegalStateException("리뷰 저장 실패");

    Number key = (Number) keyHolder.getKeys().get("review_id");

    if(key == null){
      log.info(" 저장 실패 : {}",review);
      return null;
    }else {
      log.info("저장 성공 :{}",key.longValue());
      return key.longValue();
    }

  }

  // 개별 조회
  @Override
  public Optional<Review> findById(Long reviewId) {
    String sql = "select review_id, buyer_id, order_id, order_item_id, product_id, title, content, pic,score, cdate, udate " +
        "from review where review_id = :reviewId";

    try {
      Review review = template.queryForObject(sql,
          new MapSqlParameterSource("reviewId", reviewId),
          reviewRowMapper);
      return Optional.ofNullable(review);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  // 전체 조회
  @Override
  public List<Review> findAll(Long productId) {
    log.info("ReviewDAO.findAll 호출 - productId: {}", productId);
    
    if (productId == null) {
      log.warn("productId가 null입니다. 빈 리스트를 반환합니다.");
      return new ArrayList<>();
    }
    
    String sql = "select review_id, buyer_id, order_id, order_item_id, product_id, title, content, pic,score, cdate, udate " +
        "from review where product_id = :productId " +
        "order by review_id desc";
    SqlParameterSource param = new MapSqlParameterSource().addValue("productId", productId);
    
    log.info("실행할 SQL: {}", sql);
    log.info("SQL 파라미터: productId = {}", productId);
    
    List<Review> result = template.query(sql, param, reviewRowMapper);
    log.info("SQL 실행 결과 - 리뷰 개수: {}", result.size());
    
    return result;
  }

  // 수정 (title, content, pic 만 수정 예시. 필요시 다른 필드 추가)
  @Override
  public int update(Review review) {
    String sql =
        "update review " +
            "   set title   = :title, " +
            "       content = :content, " +
            "       pic     = :pic, " +
            "       udate   = systimestamp " +
            "       score   = :score " +
            " where review_id = :reviewId";

    SqlParameterSource param = new BeanPropertySqlParameterSource(review);
    return template.update(sql, param);
  }

  // 삭제
  @Override
  public int deleteById(Long reviewId) {
    String sql = "delete from review where review_id = :reviewId";
    return template.update(sql, new MapSqlParameterSource("reviewId", reviewId));
  }
}

