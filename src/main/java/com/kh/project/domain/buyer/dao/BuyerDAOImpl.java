package com.kh.project.domain.buyer.dao;

import java.util.Map;
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

import com.kh.project.domain.entity.Buyer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Repository
@Slf4j
@RequiredArgsConstructor
public class BuyerDAOImpl implements BuyerDAO {

  final private NamedParameterJdbcTemplate template;

  // 구매자 회원가입
  @Override
  public Long save(Buyer buyer) {
    StringBuffer sql = new StringBuffer();
    sql.append("   INSERT INTO buyer ");
    sql.append("   VALUES (buyer_buyer_id.nextval,:email,:password,:name,:nickname,:tel,:gender,:birth ");
    sql.append("    ,:postNumber,:address,NULL,'활성화',systimestamp,systimestamp,NULL,null)  ");

    SqlParameterSource param = new BeanPropertySqlParameterSource(buyer);

    KeyHolder keyHolder = new GeneratedKeyHolder();

    int i = template.update(sql.toString(), param, keyHolder, new String[]{"buyer_id"});

    long buyerId = ((Number) keyHolder.getKeys().get("buyer_id")).longValue();

    return buyerId;
  }

  // 이메일로 구매자 회원 찾기
  @Override
  public Optional<Buyer> findByEmail(String email) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT * FROM buyer ");
    sql.append(" WHERE email = :email ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("email",email);

    try {
      Buyer buyer = template.queryForObject(sql.toString(), param, BeanPropertyRowMapper.newInstance(Buyer.class));

      return Optional.of(buyer);

    } catch (EmptyResultDataAccessException e) {

      return Optional.empty();

    }

  }
// 이메일로 존재 여부 확인
  @Override
  public boolean isExistEmail(String email) {
    String sql = " SELECT count(*) FROM BUYER WHERE email = :email";
    Map<String,String> param = Map.of("email",email);
    Integer i = template.queryForObject(sql.toString(), param, Integer.class);
    return i == 1 ? true : false;
  }

  //
  @Override
  public Optional<Buyer> findByBuyerId(Long buyerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT Buyer_id,EMAIL,password,name,nickname,tel,gender,birth,post_number,address,pic,status,cdate,udate,withdrawn_at,withdrawn_reason ");
    sql.append(" FROM buyer ");
    sql.append(" WHERE buyer_id = :buyer_id ");

    SqlParameterSource param  = new MapSqlParameterSource().addValue("buyer_id",buyerId);
    try {
      Buyer buyer = template.queryForObject(
          sql.toString(), param, BeanPropertyRowMapper.newInstance(Buyer.class));

      return Optional.of(buyer);

    } catch (EmptyResultDataAccessException e) {

      return Optional.empty();

    }

  }

  // 구매자 정보 수정
  @Override
  public int update(Long bid, Buyer buyer) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE buyer SET ");
    sql.append(" password = :password, ");
    sql.append(" nickname = :nickname, ");
    sql.append(" tel = :tel, ");
    sql.append(" gender = :gender, ");
    sql.append(" birth = :birth, ");
    sql.append(" post_number = :postNumber, ");
    sql.append(" address = :address, ");
    sql.append(" udate = systimestamp ");
    sql.append(" WHERE buyer_id = :bid ");

    SqlParameterSource param = new MapSqlParameterSource()
        .addValue("bid", bid)
        .addValue("password", buyer.getPassword())
        .addValue("nickname", buyer.getNickname())
        .addValue("tel", buyer.getTel())
        .addValue("gender", buyer.getGender())
        .addValue("birth", buyer.getBirth())
        .addValue("postNumber", buyer.getPostNumber())
        .addValue("address", buyer.getAddress());

    int updatedRows = template.update(sql.toString(), param);
    return updatedRows;
  }

  // 구매자 탈퇴
  @Override
  public int delete(Long bid) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE buyer ");
    sql.append(" SET status = '탈퇴' ");
    sql.append(" WHERE buyer_id = :bid ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("bid",bid);

    int i = template.update(sql.toString(),param);

    return i;

  }
}
