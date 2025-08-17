package com.kh.project.domain.popular.dao;

import com.kh.project.domain.entity.Product;
import java.util.List;

public interface PopularDAO {
  List<Product> findTopPopularProducts(int limit);
}
