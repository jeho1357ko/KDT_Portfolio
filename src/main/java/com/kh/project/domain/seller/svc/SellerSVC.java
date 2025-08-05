package com.kh.project.domain.seller.svc;

import java.util.Optional;

import com.kh.project.domain.entity.Seller;


public interface SellerSVC {
  // 판매자 저장
  Long save(Seller seller);

  // 판매자 이메일로 조회
  Optional<Seller> findByEmail(String email);

  // 판매자 이메일 중복 여부 확인
  boolean isExistEmail(String email);

  // 판매자 아이디로 조회
  Optional<Seller> findBySellerId(Long sellerId);

  // 회원 정보 수정
  int update(Long sid , Seller seller);

  //회원 탈퇴
  int delete(Long sid);
  // 사업자 번호로 가입된 계정 상태 확인
  Optional<Seller> bizRegNoBySellerId(String bizRegNo);
}
