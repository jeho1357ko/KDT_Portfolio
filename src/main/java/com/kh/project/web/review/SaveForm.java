package com.kh.project.web.review;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SaveForm {
  private Long buyerId;
  private Long orderId;
  private Long orderItemId;
  private Long productId;
  private String title;
  private String content;
  private byte[] pic;
  private Long score;
  private LocalDateTime cdate;
}
