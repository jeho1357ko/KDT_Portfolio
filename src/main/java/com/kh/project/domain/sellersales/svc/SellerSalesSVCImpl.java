package com.kh.project.domain.sellersales.svc;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.SellerOrderItem;
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

  // 판매자 기준 판매된 주문 상품 전체 목록
  @Override
  public List<SellerOrderItem> findSoldItemsBySellerId(Long sellerId) {
    return sellerSalesDAO.findSoldItemsBySellerId(sellerId);
  }

  // 판매자 기준 판매된 주문 상품 페이징 목록
  @Override
  public List<SellerOrderItem> findSoldItemsBySellerIdPaged(Long sellerId, Long page, Long size) {
    long pageIndex = page != null && page > 0 ? page : 1L;
    long pageSize = size != null && size > 0 ? size : 20L;

    long startRow = (pageIndex - 1) * pageSize + 1;
    long endRow = pageIndex * pageSize;

    return sellerSalesDAO.findSoldItemsBySellerIdPaged(sellerId, startRow, endRow);
  }

  // 판매자 기준 판매된 주문 상품 총 개수 (행 수)
  @Override
  public Long countSoldItemsBySellerId(Long sellerId) {
    return sellerSalesDAO.countSoldItemsBySellerId(sellerId);
  }

  // 판매자 기준 총 판매 상품 건수 (order_item 행 수)
  @Override
  public Long totalSoldItemsCount(Long sellerId) {
    return sellerSalesDAO.totalSoldItemsCount(sellerId);
  }
}
