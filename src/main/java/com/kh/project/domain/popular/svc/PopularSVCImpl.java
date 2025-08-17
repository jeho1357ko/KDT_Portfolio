package com.kh.project.domain.popular.svc;

import com.kh.project.domain.entity.Product;
import com.kh.project.domain.popular.dao.PopularDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PopularSVCImpl implements PopularSVC {

  private final PopularDAO popularDAO;

  @Override
  public List<Product> getTopPopularProducts(int limit) {
    int safeLimit = Math.max(1, Math.min(limit, 20));
    return popularDAO.findTopPopularProducts(safeLimit);
  }
}
