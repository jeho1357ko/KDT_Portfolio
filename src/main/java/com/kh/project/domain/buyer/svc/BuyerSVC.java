package com.kh.project.domain.buyer.svc;

import com.kh.project.domain.entity.Buyer;

import java.util.Optional;

public interface BuyerSVC {
  //회원 가입
  Long save(Buyer buyer);

  //회원 찾기
  Optional<Buyer> findByEmail(String email);

  // 회원 존재 유무
  boolean isExistEmail(String email);

  //회원 찾기
  Optional<Buyer> findByBuyerId(Long buyerId);

  // 회원 정보 수정
  int update(Long bid, Buyer buyer);

  // 회원 삭제
  int delete(Long bid);
}
