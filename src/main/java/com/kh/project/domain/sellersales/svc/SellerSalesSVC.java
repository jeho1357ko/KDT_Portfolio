package com.kh.project.domain.sellersales.svc;

import com.kh.project.domain.entity.SellerSales;

import java.util.List;

public interface SellerSalesSVC {
  //총주문 건수
  SellerSales totalOrder(Long sellerId);

  // 품목별 주문 top3
  List<SellerSales> top3Order(Long sellerId);

  // 총 판매 금액
  SellerSales totalPrice(Long sellerId);

  //품목별 판매 금액  top3
  List<SellerSales> top3Price(Long sellerId);
}
