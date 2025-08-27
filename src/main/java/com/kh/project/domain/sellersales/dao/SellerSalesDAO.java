package com.kh.project.domain.sellersales.dao;

import java.util.List;

import com.kh.project.domain.entity.SellerOrderItem;
import com.kh.project.domain.entity.SellerSales;

public interface SellerSalesDAO {
  //총주문 건수
  SellerSales totalOrder(Long sellerId);

  // 품목별 주문 top3
  List<SellerSales> top3Order(Long sellerId);

  // 총 판매 금액
  SellerSales totalPrice(Long sellerId);

  //품목별 판매 금액  top3
  List<SellerSales> top3Price(Long sellerId);

  // 판매자 기준 판매된 주문 상품 전체 목록
  List<SellerOrderItem> findSoldItemsBySellerId(Long sellerId);

  // 판매자 기준 판매된 주문 상품 페이징 목록
  List<SellerOrderItem> findSoldItemsBySellerIdPaged(Long sellerId, Long startRow, Long endRow);

  // 판매자 기준 판매된 주문 상품 총 개수 (행 수)
  Long countSoldItemsBySellerId(Long sellerId);

  // 판매자 기준 총 판매 상품 건수 (order_item 행 수)
  Long totalSoldItemsCount(Long sellerId);

}
