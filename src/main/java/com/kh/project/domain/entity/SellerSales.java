package com.kh.project.domain.entity;

import lombok.Data;

@Data
public class SellerSales {
  private  Long completedOrderCount; // 완료된 주문 수
  private  Long sellerId;            // 판매자 아이디
  private  Long productId;           // 상품 아이디
  private  String productTitle;      // 상품 제목
  private  Long orderCount;          // 주문 수
  private  Long totalSalesAmount;    // 총 판매액
  private  Long totalSales;          // 총 판매량
}

