package com.kh.project.domain.popular.svc;

import com.kh.project.domain.entity.Product;
import java.util.List;

public interface PopularSVC {
  List<Product> getTopPopularProducts(int limit);
}
