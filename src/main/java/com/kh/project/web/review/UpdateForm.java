package com.kh.project.web.review;

import lombok.Data;

@Data
public class UpdateForm {
  private String title;
  private String content;
  private byte[] pic;
  private Long score;
}
