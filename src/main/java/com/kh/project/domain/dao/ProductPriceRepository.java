package com.kh.project.domain.dao;

import com.kh.project.domain.entity.ProductPrice;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductPriceRepository extends ElasticsearchRepository<ProductPrice, String> {
    
    // 상품명으로 검색
    List<ProductPrice> findByProductNameContaining(String productName);
    
    // 등급으로 검색
    List<ProductPrice> findByGrade(String grade);
    
    // 특정 날짜 범위의 데이터 검색
    List<ProductPrice> findByPriceDateBetween(LocalDate startDate, LocalDate endDate);
    
    // 상품명과 등급으로 검색
    List<ProductPrice> findByProductNameAndGrade(String productName, String grade);
    
    // 상품명과 출처로 검색
    List<ProductPrice> findByProductNameAndSource(String productName, String source);
    
    // 상품명과 날짜 범위로 검색
    List<ProductPrice> findByProductNameAndPriceDateBetween(String productName, LocalDate startDate, LocalDate endDate);
    
    // 상품명, 등급, 날짜로 검색
    List<ProductPrice> findByProductNameAndGradeAndPriceDate(String productName, String grade, LocalDate priceDate);
    
    // 가격 범위로 검색
    List<ProductPrice> findByCurrentPriceBetween(Double minPrice, Double maxPrice);
    
    // 데이터 출처로 검색
    List<ProductPrice> findBySource(String source);
    
    // 카테고리로 검색
    List<ProductPrice> findByCategory(String category);
    
    // 최신 데이터 조회 (날짜 내림차순)
    List<ProductPrice> findByOrderByPriceDateDesc();
    
    // 특정 상품의 최신 가격 조회
    List<ProductPrice> findByProductNameOrderByPriceDateDesc(String productName);
} 