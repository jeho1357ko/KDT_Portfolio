package com.kh.project.domain.entity;

import lombok.Data;

//게시글 엔티티
@Data
public class Product {
  private Long productId;           // 상품 아이디
  private Long sellerId;            // 판매자 아이디
  private String title;             // 상품 제목
  private String content;           // 상품 내용
  private String productName;       // 상품 이름
  private Long deliveryFee;         // 배송비
  private String deliveryInformation; // 배송 정보
  private String deliveryMethod;    // 배송 방법
  private String CountryOfOrigin;   // 원산지
  private Long price;               // 가격
  private Long quantity;            // 수량
  private String thumbnail;         // 썸네일 'url'
  private String status;            // 상태 '판매중','재고소진','비활성화'
  private String cdate;      // 생성일
  private String udate;      // 수정일
}
