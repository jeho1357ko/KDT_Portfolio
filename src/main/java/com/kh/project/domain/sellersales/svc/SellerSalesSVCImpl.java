package com.kh.project.domain.sellersales.svc;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.SellerSales;
import com.kh.project.domain.sellersales.dao.SellerSalesDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class SellerSalesSVCImpl implements SellerSalesSVC {

  final private SellerSalesDAO sellerSalesDAO;

  // 주문 건수 조회
  @Override
  public SellerSales totalOrder(Long sellerId) {
    return sellerSalesDAO.totalOrder(sellerId);
  }

  // 주문 건수 상위 3개 조회
  @Override
  public List<SellerSales> top3Order(Long sellerId) {
    return sellerSalesDAO.top3Order(sellerId);
  }

  // 판매 금액 조회
  @Override
  public SellerSales totalPrice(Long sellerId) {
    return sellerSalesDAO.totalPrice(sellerId);
  }

  // 판매 금액 상위 3개 조회
  @Override
  public List<SellerSales> top3Price(Long sellerId) {
    return sellerSalesDAO.top3Price(sellerId);
  }
}
