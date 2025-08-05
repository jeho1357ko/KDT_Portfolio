package com.kh.project.domain.product.svc;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.Product;
import com.kh.project.domain.entity.ProductPrice;
import com.kh.project.domain.product.dao.ProductDAO;
import com.kh.project.domain.svc.PublicDataService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductSVCImpl implements ProductSVC{

  private final ProductDAO productDAO;
  private final ElasticsearchClient esClient;
  
  @Autowired
  private PublicDataService publicDataService;

  // 상품 저장
  @Override
  public Long saveProduct(Product product, Long sid) {
    Long productId = productDAO.saveProduct(product, sid);
    Optional<Product> optionalProduct = productDAO.findById(productId);
    if(optionalProduct.isPresent()){
      Product esSaveForm = optionalProduct.get();
      try {
        esClient.index(i -> i
            .index("product")
            .id(productId.toString())
            .document(esSaveForm));
        
        // 상품 등록 시 자동으로 가격 데이터 연동
        syncPriceDataForProduct(product.getProductName());
        
      } catch (IOException e) {
        // 로깅하거나 예외 처리
        log.error("Elasticsearch indexing error: ", e);
        // 상황에 따라 롤백하거나 무시
      }

    } else {
      log.error("DB에서 방금 저장한 productId={}를 다시 조회했지만 존재하지 않음", productId);
      throw new IllegalStateException("상품 저장 후 조회 실패: productId=" + productId);
    }

    return productId;
  }
  
  // 상품명에 해당하는 가격 데이터 자동 연동
  private void syncPriceDataForProduct(String productName) {
    try {
      log.info("상품 '{}'의 가격 데이터 자동 연동 시작", productName);
      
      // CSV 파일에서 직접 데이터 검색
      List<ProductPrice> matchedPrices = findMatchingPricesFromCSV(productName);
      
      if (!matchedPrices.isEmpty()) {
        // Elasticsearch에 가격 데이터 저장
        for (ProductPrice price : matchedPrices) {
          try {
            // 객체 검증
            if (price.getId() == null || price.getId().isEmpty()) {
              log.error("가격 데이터 ID가 null입니다: {}", price.getProductName());
              continue;
            }
            
            if (price.getProductName() == null || price.getProductName().isEmpty()) {
              log.error("가격 데이터 상품명이 null입니다: ID={}", price.getId());
              continue;
            }
            
            log.info("저장 시도: {} - {} - {} - ID: {}", 
                price.getProductName(), price.getGrade(), price.getUnit(), price.getId());
            
            // Elasticsearch 저장
            var response = esClient.index(i -> i
                .index("product_prices")
                .id(price.getId())
                .document(price));
                
            log.info("가격 데이터 저장 완료: {} - {} - {} - 결과: {}", 
                price.getProductName(), price.getGrade(), price.getUnit(), response.result());
          } catch (Exception e) {
            log.error("가격 데이터 저장 실패: {} - {} - {} - 오류: {}", 
                price.getProductName(), price.getGrade(), price.getUnit(), e.getMessage());
            // 스택 트레이스 출력
            e.printStackTrace();
          }
        }
        log.info("✅ 상품 '{}'의 가격 데이터 {}개 자동 연동 완료 - 가격비교 기능 활성화", productName, matchedPrices.size());
      } else {
        log.info("⚠️ 상품 '{}'에 대한 가격 데이터가 CSV에서 발견되지 않았습니다. - 가격비교 기능 비활성화", productName);
      }
    } catch (Exception e) {
      log.error("❌ 상품 '{}' 가격 데이터 연동 중 오류: {}", productName, e.getMessage());
      e.printStackTrace();
    }
  }
  
  // CSV 파일에서 상품명과 매칭되는 가격 데이터 찾기
  private List<ProductPrice> findMatchingPricesFromCSV(String productName) {
    List<ProductPrice> matchedPrices = new ArrayList<>();
    
    try {
      // CSV 파일 경로
      String csvPath = "python/market_price_data_unlimited_processed.csv";
      java.nio.file.Path path = java.nio.file.Paths.get(csvPath);
      
      if (!java.nio.file.Files.exists(path)) {
        log.warn("CSV 파일을 찾을 수 없습니다: {}", csvPath);
        return matchedPrices;
      }
      
      // CSV 파일 읽기
      List<String> lines = java.nio.file.Files.readAllLines(path);
      
      for (int i = 1; i < lines.size(); i++) { // 헤더 제외
        String line = lines.get(i);
        String[] columns = line.split(",");
        
        if (columns.length >= 10) {
          String csvProductName = columns[4].trim();
          
          // 상품명 매칭 (부분 일치도 허용)
          if (isProductNameMatch(productName, csvProductName)) {
            try {
              ProductPrice price = createProductPriceFromCSV(columns);
              matchedPrices.add(price);
              log.info("매칭된 상품 발견: {} -> {}", productName, csvProductName);
            } catch (Exception e) {
              log.error("CSV 데이터 파싱 오류: {}", e.getMessage());
            }
          }
        }
      }
      
    } catch (Exception e) {
      log.error("CSV 파일 읽기 오류: {}", e.getMessage());
    }
    
    return matchedPrices;
  }
  
  // 상품명 매칭 로직 (부분 일치 포함)
  private boolean isProductNameMatch(String dbProductName, String csvProductName) {
    // 정확한 일치
    if (dbProductName.equals(csvProductName)) {
      return true;
    }
    
    // 부분 일치 (상품명이 CSV 상품명에 포함되는 경우)
    if (csvProductName.contains(dbProductName)) {
      return true;
    }
    
    // 부분 일치 (CSV 상품명이 DB 상품명에 포함되는 경우)
    if (dbProductName.contains(csvProductName)) {
      return true;
    }
    
    // 특수한 경우들 처리
    String[] dbKeywords = dbProductName.split("\\s+");
    String[] csvKeywords = csvProductName.split("\\s+");
    
    // 키워드 기반 매칭
    for (String dbKeyword : dbKeywords) {
      for (String csvKeyword : csvKeywords) {
        if (dbKeyword.length() > 1 && csvKeyword.length() > 1 && 
            dbKeyword.equals(csvKeyword)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // CSV 데이터로부터 ProductPrice 객체 생성
  private ProductPrice createProductPriceFromCSV(String[] columns) {
    ProductPrice price = new ProductPrice();
    
    try {
      // 고유 ID 생성 (CSV 데이터 기반)
      String uniqueId = columns[4].trim() + "_" + columns[9].trim() + "_" + columns[7].trim() + "_" + columns[3].trim();
      price.setId(uniqueId);
      
      // CSV 컬럼: AVG,ROWNO,PREAVG_2,MM_0,PUM_NAME,PREAVG_1,MM_1,UNIT_NAME,MM_2,GRADE_NAME
      price.setProductName(columns[4].trim());
      price.setGrade(columns[9].trim());
      price.setUnit(columns[7].trim());
      price.setCurrentPrice(Double.parseDouble(columns[0].trim()));
      price.setPreviousMonthPrice(Double.parseDouble(columns[5].trim()));
      price.setTwoMonthsAgoPrice(Double.parseDouble(columns[2].trim()));
      
      // 날짜 변환
      String dateStr = columns[3].trim();
      int year = Integer.parseInt(dateStr.substring(0, 4));
      int month = Integer.parseInt(dateStr.substring(4, 6));
      int day = dateStr.length() > 6 ? Integer.parseInt(dateStr.substring(6, 8)) : 1;
      
      price.setPriceDate(java.time.LocalDate.of(year, month, day));
      price.setSource("공공데이터");
      price.setMarketType("가락시장");
      price.setCategory("청과");
      
    } catch (Exception e) {
      log.error("ProductPrice 객체 생성 중 오류: {}", e.getMessage());
      throw e;
    }
    
    return price;
  }

  // 상품 조회
  @Override
  public Optional<Product> findById(Long pid) {
    return productDAO.findById(pid);
  }

  // 상품 목록 조회
  @Override
  public List<Product> findByIds(Long sid) {
    return productDAO.findByIds(sid);
  }

  // 상품 수정
  @Override
  public int updateById(Long pid, Product product) {
    log.info("ProductSVCImpl.updateById 호출: pid={}, product={}", pid, product);
    int result = productDAO.updateById(pid, product);
    log.info("ProductSVCImpl.updateById 결과: {}", result);
    return result;
  }

  // 상품 삭제
  @Override
  public int deleteById(Long pid) {
    return productDAO.deleteById(pid);
  }

  // 상품 목록 삭제
  @Override
  public int deleteByIds(List<Long> list) {
    return productDAO.deleteByIds(list);
  }

  // 상품 목록 조회
  @Override
  public List<Product> allProduct() {
    return productDAO.allProduct();
  }

  // 판매자 ID로 상품들 비활성화
  @Override
  public int deactivateBySellerId(Long sellerId) {
    log.info("ProductSVCImpl.deactivateBySellerId 호출: sellerId={}", sellerId);
    int result = productDAO.deactivateBySellerId(sellerId);
    log.info("ProductSVCImpl.deactivateBySellerId 결과: {}", result);
    return result;
  }
  
  @Override
  public List<String> findMatchingProductNames(String searchTerm) {
    List<String> matchingProducts = new ArrayList<>();
    
    try {
      // CSV 파일에서 상품명 검색
      String csvPath = "python/market_price_data_unlimited_processed.csv";
      java.nio.file.Path path = java.nio.file.Paths.get(csvPath);
      
      if (!java.nio.file.Files.exists(path)) {
        log.warn("CSV 파일을 찾을 수 없습니다: {}", csvPath);
        return matchingProducts;
      }
      
      // CSV 파일 읽기
      List<String> lines = java.nio.file.Files.readAllLines(path);
      Set<String> uniqueProducts = new HashSet<>();
      
      for (int i = 1; i < lines.size(); i++) { // 헤더 제외
        String line = lines.get(i);
        String[] columns = line.split(",");
        
        if (columns.length >= 10) {
          String csvProductName = columns[4].trim();
          
          // 검색어와 매칭되는 상품명 찾기
          if (isProductNameMatch(searchTerm, csvProductName)) {
            uniqueProducts.add(csvProductName);
          }
        }
      }
      
      // 정렬된 리스트로 변환
      matchingProducts = new ArrayList<>(uniqueProducts);
      Collections.sort(matchingProducts);
      
      // 최대 10개까지만 반환
      if (matchingProducts.size() > 10) {
        matchingProducts = matchingProducts.subList(0, 10);
      }
      
      log.info("검색어 '{}'에 대한 매칭 상품 {}개 발견", searchTerm, matchingProducts.size());
      
    } catch (Exception e) {
      log.error("매칭 상품명 검색 중 오류: {}", e.getMessage());
    }
    
    return matchingProducts;
  }
}
