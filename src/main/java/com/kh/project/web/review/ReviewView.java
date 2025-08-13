package com.kh.project.web.review;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewView {
  private Long reviewId;
  private Long buyerId;
  private Long orderId;
  private Long orderItemId;
  private Long productId;
  private String title;
  private String content;
  private byte[] pic;
  private Long score;
  private LocalDateTime cdate;
  private LocalDateTime udate;

  // 추가: 작성자 닉네임
  private String buyerNickname;
}