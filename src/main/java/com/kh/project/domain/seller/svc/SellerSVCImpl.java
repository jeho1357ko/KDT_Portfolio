package com.kh.project.domain.seller.svc;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.project.domain.entity.Seller;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.domain.seller.dao.SellerDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SellerSVCImpl implements SellerSVC {

  private final SellerDAO sellerDAO;
  private final ProductSVC productSVC;

  // 판매자 저장
  @Override
  public Long save(Seller seller) {
    return sellerDAO.save(seller);
  }

  // 판매자 이메일로 조회
  @Override
  public Optional<Seller> findByEmail(String email) {
    return sellerDAO.findByEmail(email);
  }

  // 판매자 이메일 중복 여부 확인
  @Override
  public boolean isExistEmail(String email) {
    return sellerDAO.isExistEmail(email);
  }

  // 판매자 아이디로 조회
  @Override
  public Optional<Seller> findBySellerId(Long sellerId) {
    return sellerDAO.findBySellerId(sellerId);
  }

  // 판매자 정보 수정
  @Override
  public int update(Long sid, Seller seller) {
    return sellerDAO.update(sid,seller);
  }

  // 판매자 탈퇴
  @Override
  @Transactional
  public int delete(Long sid) {
    log.info("SellerSVCImpl.delete 호출: sid={}", sid);
    
    // 1. 해당 판매자의 모든 상품을 비활성화
    int deactivatedProducts = productSVC.deactivateBySellerId(sid);
    log.info("비활성화된 상품 수: {}", deactivatedProducts);
    
    // 2. 판매자 계정을 탈퇴 상태로 변경
    int result = sellerDAO.delete(sid);
    log.info("판매자 탈퇴 처리 결과: {}", result);
    
    return result;
  }

  // 사업자 번호로 가입된 계정 상태 확인
  @Override
  public Optional<Seller> bizRegNoBySellerId(String bizRegNo) {
    return sellerDAO.bizRegNoBySellerId(bizRegNo);
  }
}
