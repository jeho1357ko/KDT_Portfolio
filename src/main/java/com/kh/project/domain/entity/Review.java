package com.kh.project.domain.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Review {
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
}
