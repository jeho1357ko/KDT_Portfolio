package com.kh.project.domain.seller.dao;

import co.elastic.clients.elasticsearch.xpack.usage.Sql;
import com.kh.project.domain.entity.Seller;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
@Slf4j
public class SellerDAOImpl implements SellerDAO{

  private final NamedParameterJdbcTemplate template;
  //회원 가입
  @Override
  public Long save(Seller seller) {
    StringBuffer sql = new StringBuffer();
    sql.append(" INSERT INTO seller ");
    sql.append(" VALUES (seller_seller_id.nextval,:email,:password,:bizRegNo,:shopName,:name,:shopAddress, ");
    sql.append(" :tel,:pic,:postNumber,'활성화',systimestamp,systimestamp,null,null) ");

    SqlParameterSource param = new BeanPropertySqlParameterSource(seller);

    KeyHolder keyHolder = new GeneratedKeyHolder();

    template.update(sql.toString(),param,keyHolder,new String[]{"seller_id"});

    long id = ((Number)keyHolder.getKeys().get("seller_Id")).longValue();

    return id;
  }

  // 이메일로 회원 존재 여부 확인
  @Override
  public boolean isExistEmail(String email) {
    String sql = " SELECT count(*) FROM SELLER WHERE email = :email";
    Map<String,String> param = Map.of("email",email);
    Integer i = template.queryForObject(sql.toString(), param, Integer.class);

    return i == 1 ? true : false;
  }
  // 이메일로 회원 정보 조회
  @Override
  public Optional<Seller> findByEmail(String email) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT seller_id,EMAIL,password,biz_reg_no,shop_name,name,shop_address,tel,pic,post_number,status,cdate,udate ");
    sql.append(" FROM seller ");
    sql.append(" WHERE email = :email ");

    SqlParameterSource param  = new MapSqlParameterSource().addValue("email",email);

    try {
      Seller seller = template.queryForObject(
          sql.toString(), param, BeanPropertyRowMapper.newInstance(Seller.class));

      return Optional.of(seller);

    } catch (EmptyResultDataAccessException e) {

      return Optional.empty();

    }
  }



  // 내부 관리 아이디로 회원 정보 조회
  @Override
  public Optional<Seller> findBySellerId(Long sellerId) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT seller_id,EMAIL,password,biz_reg_no,shop_name,name,shop_address,tel,pic,post_number,status,cdate,udate ");
    sql.append(" FROM seller ");
    sql.append(" WHERE seller_id = :seller_id ");

    SqlParameterSource param  = new MapSqlParameterSource().addValue("seller_id",sellerId);
    try {
      Seller seller = template.queryForObject(
          sql.toString(), param, BeanPropertyRowMapper.newInstance(Seller.class));

      return Optional.of(seller);

    } catch (EmptyResultDataAccessException e) {

      return Optional.empty();

    }
  }

  //회원 정보 수정
  @Override
  public int update(Long sid, Seller seller) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE seller SET ");
    sql.append(" tel  = :tel, shop_address = :shop_address, pic = :pic, shop_name = :shop_name, post_number = :post_number ");
    sql.append(" WHERE seller_id = :sid ");

    MapSqlParameterSource param = new MapSqlParameterSource()
        .addValue("tel", seller.getTel())
        .addValue("shop_address", seller.getShopAddress())
        .addValue("pic", seller.getPic())
        .addValue("shop_name", seller.getShopName())
        .addValue("sid", sid)
        .addValue("post_number", seller.getPostNumber());

    int i = template.update(sql.toString(), param);

    return i;
  }

// 회원 탈퇴
  @Override
  public int delete(Long sid) {
    StringBuffer sql = new StringBuffer();
    sql.append(" UPDATE seller ");
    sql.append(" SET status = '탈퇴' ");
    sql.append(" WHERE seller_id = :sid ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("sid",sid);

    int i = template.update(sql.toString(),param);

    return i;
  }
  // 사업자 번호로 가입된 계정 상태 확인
  @Override
  public Optional<Seller> bizRegNoBySellerId(String bizRegNo) {
    StringBuffer sql = new StringBuffer();
    sql.append(" SELECT * FROM seller  ");
    sql.append(" WHERE biz_reg_no = :bizRegNo ");

    SqlParameterSource param = new MapSqlParameterSource().addValue("bizRegNo",bizRegNo);

    try {
      Seller seller = template.queryForObject(
          sql.toString(),
          param,
          BeanPropertyRowMapper.newInstance(Seller.class)
      );
      return Optional.of(seller);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }


}


