package com.kh.project.web.product;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SaveForm {
  private Long productId;          // 상품 아이디
  private Long sellerId;           // 판매자 아이디
  private String title;            // 상품 제목
  private String content;          // 상품 내용
  private String productName;      // 상품 이름
  private Long deliveryFee;        // 배송비
  private String deliveryInformation; // 배송 정보
  private String deliveryMethod;     // 배송 방법
  private String CountryOfOrigin;    // 원산지
  private Long price;                // 가격
  private Long quantity;             // 수량
  private String thumbnail;          // 썸네일 'url'
  private String status;             // 상태
  private LocalDateTime cdate;       // 생성일
  private LocalDateTime udate;       // 수정일
}
