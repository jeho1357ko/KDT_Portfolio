package com.kh.project.domain.entity;

import lombok.Data;

import java.time.LocalDate;

@Data
public class Youtube {
  private String title;
  private String url;
  private String thumbnail;
  private String tags;
  private String channelName;
  private LocalDate uploadDate;
}
