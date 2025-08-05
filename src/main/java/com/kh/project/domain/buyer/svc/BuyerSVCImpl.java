package com.kh.project.domain.buyer.svc;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kh.project.domain.buyer.dao.BuyerDAO;
import com.kh.project.domain.entity.Buyer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구매자 서비스 구현체
 * 구매자 관련 비즈니스 로직을 처리합니다.
 */
@RequiredArgsConstructor
@Slf4j
@Service
public class BuyerSVCImpl implements BuyerSVC {

  final private BuyerDAO buyerDAO;

  /**
   * 구매자 정보를 저장합니다.
   * @param buyer 저장할 구매자 정보
   * @return 저장된 구매자의 ID
   */
  @Override
  public Long save(Buyer buyer) {
    return buyerDAO.save(buyer);
  }

  /**
   * 이메일로 구매자를 조회합니다.
   * @param email 조회할 구매자의 이메일
   * @return 구매자 정보 (Optional)
   */
  @Override
  public Optional<Buyer> findByEmail(String email) {
    return buyerDAO.findByEmail(email);
  }

  /**
   * 이메일 중복 여부를 확인합니다.
   * @param email 확인할 이메일
   * @return 중복 여부 (true: 중복, false: 중복 아님)
   */
  @Override
  public boolean isExistEmail(String email) {
    return buyerDAO.isExistEmail(email);
  }

  /**
   * 구매자 ID로 구매자를 조회합니다.
   * @param buyerId 조회할 구매자의 ID
   * @return 구매자 정보 (Optional)
   */
  @Override
  public Optional<Buyer> findByBuyerId(Long buyerId) {
    return buyerDAO.findByBuyerId(buyerId);
  }

  /**
   * 구매자 정보를 수정합니다.
   * @param bid 수정할 구매자의 ID
   * @param buyer 수정할 구매자 정보
   * @return 수정된 행의 수
   */
  @Override
  public int update(Long bid, Buyer buyer) {
    return buyerDAO.update(bid, buyer);
  }

  /**
   * 구매자를 삭제합니다.
   * @param bid 삭제할 구매자의 ID
   * @return 삭제된 행의 수
   */
  @Override
  public int delete(Long bid) {
    return buyerDAO.delete(bid);
  }
}
