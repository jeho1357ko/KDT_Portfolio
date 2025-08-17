package com.kh.project.web.api;

import com.kh.project.domain.entity.Product;
import com.kh.project.domain.entity.Youtube;
import lombok.Data;

import java.util.List;

@Data
public class SearchDTO {
  private List<Product> products;
  private List<Youtube> youtubeList;
}
