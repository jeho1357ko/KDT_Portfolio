package com.kh.project.web.api;

import java.util.List;

import com.kh.project.domain.entity.Product;
import com.kh.project.domain.entity.Youtube;

import lombok.Data;

@Data
public class SearchDTO {
  private List<Product> products;
  private List<Youtube> youtubeList;
  private long totalCount; // 전체 검색 결과 수
}
