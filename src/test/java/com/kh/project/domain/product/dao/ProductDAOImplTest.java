package com.kh.project.domain.product.dao;

import com.kh.project.domain.entity.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ProductDAOImplTest {

  private static final Logger log = LoggerFactory.getLogger(ProductDAOImplTest.class);
  @Autowired
  public ProductDAO productDAO;


  @Test
  @DisplayName("등록")
  void saveProduct() {
    Product product = new Product();
    product.setTitle("테스트");
    product.setContent("테스트");
    product.setPrice(111l);
    product.setQuantity(22l);

    product.setThumbnail(null);
    product.setStatus("판매중");
    productDAO.saveProduct(product,2l);
  }

  @Test
  void productRowMapper() {
  }

  @Test
  @DisplayName("목록")
  void findByIds() {
    List<Product> ids = productDAO.findByIds(2l);
    for (Product product : ids) {
      log.info("product={}", product);
    }
  }

  @Test
  @DisplayName("개별 조회")
  void findById() {
    Optional<Product> optionalProduct = productDAO.findById(7l);
    if(optionalProduct.isPresent()){
      Product product = optionalProduct.get();
      log.info("product = {}",product);
    }
  }

  @Test
  @DisplayName("수정")
  void updateById() {
    Product product = new Product();
    product.setTitle("테스트");
    product.setContent("테스트");
    product.setUdate(null);
    product.setStatus("판매중");
    product.setThumbnail("테스트");

    product.setPrice(10000l);
    product.setQuantity(300l);
    productDAO.updateById(7l,product);
  }

  @Test
  @DisplayName("단건 삭제")
  void deleteById() {
    productDAO.deleteById(7l);
  }

  @Test
  void deleteByIds() {
    List<Long> list = new ArrayList<>();
    list.add(8l);
    list.add(9l);
    productDAO.deleteByIds(list);
  }
}