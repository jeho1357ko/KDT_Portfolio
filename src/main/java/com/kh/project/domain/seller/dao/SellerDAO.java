package com.kh.project.domain.seller.dao;

import com.kh.project.domain.entity.Seller;

import java.util.Optional;

public interface SellerDAO {
  //회원 가입
  Long save(Seller seller);

  //회원 찾기
  Optional<Seller> findByEmail(String email);

  // 회원 존재 유무
  boolean isExistEmail(String email);

  //회원 찾기
  Optional<Seller> findBySellerId(Long sellerId);

  // 회원 정보 수정
  int update(Long sid, Seller seller);

  // 회원 삭제
  int delete(Long sid);

  // 사업자 번호로 가입된 계정 상태 확인
  Optional<Seller> bizRegNoBySellerId(String bizRegNo);

}
