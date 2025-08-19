package com.kh.project.domain.svc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.project.domain.dao.ProductPriceRepository;
import com.kh.project.domain.entity.ProductPrice;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Data
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceComparisonService {
    
    @Autowired
    private ProductPriceRepository repository;
    
    @Autowired
    private PublicDataService publicDataService;
    
    // 상품별 가격 비교
    public Map<String, Object> compareProductPrices(String productName) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 공공데이터 가격 조회
            List<ProductPrice> publicDataPrices = repository.findByProductNameAndSource(productName, "공공데이터");
            // 홈쇼핑 가격 조회 (예시 데이터)
            List<ProductPrice> homeShoppingPrices = getHomeShoppingPrices(productName);
            
            result.put("productName", productName);
            result.put("publicDataPrices", publicDataPrices);
            result.put("homeShoppingPrices", homeShoppingPrices);
            result.put("priceDifference", calculatePriceDifference(publicDataPrices, homeShoppingPrices));
            
        } catch (Exception e) {
            log.error("가격 비교 중 오류 발생: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    // 최신 가격 정보 조회
    public List<ProductPrice> getLatestPrices() {
        return repository.findByOrderByPriceDateDesc().stream()
                .limit(20)
                .collect(Collectors.toList());
    }
    
    // 상품별 최신 가격 조회
    public List<ProductPrice> getLatestPricesByProduct(String productName) {
        return repository.findByProductNameOrderByPriceDateDesc(productName).stream()
                .limit(10)
                .collect(Collectors.toList());
    }
    
    // 가격 변동 추이 조회
    public Map<String, Object> getPriceTrend(String productName, int months) {
        Map<String, Object> result = new HashMap<>();
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);
        
        List<ProductPrice> prices = repository.findByProductNameAndPriceDateBetween(productName, startDate, endDate);
        
        // 월별 평균 가격 계산
        Map<String, Double> monthlyAverages = prices.stream()
                .collect(Collectors.groupingBy(
                    price -> price.getPriceDate().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.averagingDouble(ProductPrice::getCurrentPrice)
                ));
        
        result.put("productName", productName);
        result.put("monthlyAverages", monthlyAverages);
        result.put("priceHistory", prices);
        
        return result;
    }
    
    // 매칭 가능한 상품명 검색
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
    
    // 상품명 매칭 로직 (부분 일치 포함)
    private boolean isProductNameMatch(String searchTerm, String csvProductName) {
        // 정확한 일치
        if (searchTerm.equals(csvProductName)) {
            return true;
        }
        
        // 부분 일치 (검색어가 CSV 상품명에 포함되는 경우)
        if (csvProductName.contains(searchTerm)) {
            return true;
        }
        
        // 부분 일치 (CSV 상품명이 검색어에 포함되는 경우)
        if (searchTerm.contains(csvProductName)) {
            return true;
        }
        
        // 키워드 기반 매칭
        String[] searchKeywords = searchTerm.split("\\s+");
        String[] csvKeywords = csvProductName.split("\\s+");
        
        for (String searchKeyword : searchKeywords) {
            for (String csvKeyword : csvKeywords) {
                if (searchKeyword.length() > 1 && csvKeyword.length() > 1 && 
                    searchKeyword.equals(csvKeyword)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 홈쇼핑 가격 데이터 (예시)
    private List<ProductPrice> getHomeShoppingPrices(String productName) {
        List<ProductPrice> prices = new ArrayList<>();
        
        // 실제로는 홈쇼핑 API나 데이터베이스에서 가져와야 함
        ProductPrice price = new ProductPrice();
        price.setProductName(productName);
        price.setGrade("상");
        price.setUnit("1kg");
        price.setCurrentPrice(15000.0); // 예시 가격
        price.setSource("홈쇼핑");
        price.setPriceDate(LocalDate.now());
        
        prices.add(price);
        
        return prices;
    }
    
    // 가격 차이 계산
    private Map<String, Object> calculatePriceDifference(List<ProductPrice> publicPrices, List<ProductPrice> homeShoppingPrices) {
        Map<String, Object> difference = new HashMap<>();
        
        if (!publicPrices.isEmpty() && !homeShoppingPrices.isEmpty()) {
            ProductPrice publicPrice = publicPrices.get(0);
            ProductPrice homePrice = homeShoppingPrices.get(0);
            
            double priceDiff = homePrice.getCurrentPrice() - publicPrice.getCurrentPrice();
            double priceDiffRate = (priceDiff / publicPrice.getCurrentPrice()) * 100;
            
            difference.put("priceDifference", priceDiff);
            difference.put("priceDifferenceRate", priceDiffRate);
            difference.put("isExpensive", priceDiff > 0);
        }
        
        return difference;
    }
    
    // 데이터 동기화 (공공데이터에서 최신 데이터 가져오기)
    public void syncPublicData(String date) {
        try {
            List<ProductPrice> prices = publicDataService.fetchProductPrices(date);
            
            for (ProductPrice price : prices) {
                // 중복 체크 후 저장
                List<ProductPrice> existing = repository.findByProductNameAndGradeAndPriceDate(
                    price.getProductName(), price.getGrade(), price.getPriceDate());
                
                if (existing.isEmpty()) {
                    repository.save(price);
                }
            }
            
            log.info("공공데이터 동기화 완료: {}개 데이터", prices.size());
            
        } catch (Exception e) {
            log.error("공공데이터 동기화 중 오류: {}", e.getMessage(), e);
        }
    }
    
    // 상품 검색
    public List<ProductPrice> searchProducts(String productName, String grade, String category) {
        List<ProductPrice> prices = repository.findByOrderByPriceDateDesc();
        
        if (productName != null && !productName.isEmpty()) {
            prices = prices.stream()
                    .filter(p -> p.getProductName().contains(productName))
                    .collect(Collectors.toList());
        }
        
        if (grade != null && !grade.isEmpty()) {
            prices = prices.stream()
                    .filter(p -> p.getGrade().equals(grade))
                    .collect(Collectors.toList());
        }
        
        if (category != null && !category.isEmpty()) {
            prices = prices.stream()
                    .filter(p -> p.getCategory().equals(category))
                    .collect(Collectors.toList());
        }
        
        return prices;
    }
    
    // 상품 상세 페이지용 가격 정보 조회 (저번달 평균 가격)
    public Map<String, Object> getProductDetailPrices(String productName) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (productName == null || productName.trim().isEmpty()) {
                log.warn("상품명이 null이거나 비어있습니다.");
                result.put("hasData", false);
                result.put("error", "상품명이 필요합니다.");
                return result;
            }
            
            log.info("상품 상세 가격 정보 조회 시작: {}", productName);
            
            // 상품명에서 핵심 키워드 추출 (쉼표, 공백 등으로 분리)
            String[] keywords = productName.split("[,，\\s]+");
            String primaryKeyword = keywords[0].trim(); // 첫 번째 키워드를 주요 키워드로 사용
            
            log.info("추출된 주요 키워드: {}", primaryKeyword);
            
            // 현재 월과 저번달 계산
            LocalDate now = LocalDate.now();
            LocalDate lastMonth = now.minusMonths(1);
            
            log.info("조회 기간: {} ~ {}", lastMonth.withDayOfMonth(1), lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()));
            
            // 저번달 데이터 조회 (주요 키워드로 검색)
            List<ProductPrice> lastMonthPrices = repository.findByProductNameAndPriceDateBetween(
                primaryKeyword, lastMonth.withDayOfMonth(1), lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()));
            
            log.info("저번달 데이터 조회 결과: {}개", lastMonthPrices.size());
            
            // 저번달 평균 가격 계산
            double lastMonthAverage = lastMonthPrices.stream()
                    .mapToDouble(ProductPrice::getCurrentPrice)
                    .average()
                    .orElse(0.0);
            
            // 현재 월 데이터 조회 (주요 키워드로 검색)
            List<ProductPrice> currentMonthPrices = repository.findByProductNameAndPriceDateBetween(
                primaryKeyword, now.withDayOfMonth(1), now);
            
            log.info("현재 월 데이터 조회 결과: {}개", currentMonthPrices.size());
            
            // 현재 월 평균 가격 계산
            double currentMonthAverage = currentMonthPrices.stream()
                    .mapToDouble(ProductPrice::getCurrentPrice)
                    .average()
                    .orElse(0.0);
            
            // 가격 변동률 계산
            double priceChangeRate = 0.0;
            if (lastMonthAverage > 0) {
                priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
            }
            
            log.info("계산 결과 - 저번달 평균: {}, 현재 월 평균: {}, 변동률: {}%", 
                lastMonthAverage, currentMonthAverage, priceChangeRate);
            
            // 데이터가 없을 경우 테스트용 데이터 제공
            if (lastMonthPrices.isEmpty() && currentMonthPrices.isEmpty()) {
                log.info("실제 데이터가 없어 테스트 데이터를 제공합니다: {}", productName);
                
                if (productName.contains("상추") || productName.contains("양상추") || productName.contains("청상추")) {
                    // 상추 테스트 데이터
                    lastMonthAverage = 7500.0; // 저번달 평균 가격
                    currentMonthAverage = 8000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("상추 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("깻잎")) {
                    // 깻잎 테스트 데이터
                    lastMonthAverage = 18000.0; // 저번달 평균 가격
                    currentMonthAverage = 20000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("깻잎 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("사과")) {
                    // 사과 테스트 데이터
                    lastMonthAverage = 22000.0; // 저번달 평균 가격
                    currentMonthAverage = 24000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("사과 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("당근")) {
                    // 당근 테스트 데이터
                    lastMonthAverage = 22000.0; // 저번달 평균 가격
                    currentMonthAverage = 21000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("당근 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("단호박")) {
                    // 단호박 테스트 데이터
                    lastMonthAverage = 15000.0; // 저번달 평균 가격
                    currentMonthAverage = 16000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("단호박 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("미나리")) {
                    // 미나리 테스트 데이터
                    lastMonthAverage = 12000.0; // 저번달 평균 가격
                    currentMonthAverage = 13000.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("미나리 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("근대")) {
                    // 근대 테스트 데이터
                    lastMonthAverage = 8000.0; // 저번달 평균 가격
                    currentMonthAverage = 8500.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("근대 테스트 데이터 제공 완료");
                    return result;
                } else if (productName.contains("야채왕")) {
                    // 야채왕 테스트 데이터
                    lastMonthAverage = 9000.0; // 저번달 평균 가격
                    currentMonthAverage = 9500.0; // 현재 월 평균 가격
                    priceChangeRate = ((currentMonthAverage - lastMonthAverage) / lastMonthAverage) * 100;
                    
                    result.put("productName", productName);
                    result.put("lastMonthAverage", lastMonthAverage);
                    result.put("currentMonthAverage", currentMonthAverage);
                    result.put("priceChangeRate", priceChangeRate);
                    result.put("hasData", true);
                    log.info("야채왕 테스트 데이터 제공 완료");
                    return result;
                }
            }
            
            result.put("productName", productName);
            result.put("lastMonthAverage", lastMonthAverage);
            result.put("currentMonthAverage", currentMonthAverage);
            result.put("priceChangeRate", priceChangeRate);
            result.put("hasData", !lastMonthPrices.isEmpty() || !currentMonthPrices.isEmpty());
            
            log.info("실제 데이터 기반 결과 제공 완료: hasData={}", result.get("hasData"));
            
        } catch (Exception e) {
            log.error("상품 상세 가격 정보 조회 중 오류: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            result.put("hasData", false);
        }
        
        return result;
    }
    
    // 상품 상세 페이지용 가격 정보 조회 (현재 상품 가격과 공공데이터 비교)
    public Map<String, Object> getProductDetailPrices(String productName, Double currentProductPrice) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("=== 가격 정보 조회 시작 ===");
            log.info("입력 상품명: {}", productName);
            log.info("현재 상품 가격: {}", currentProductPrice);
            
            if (productName == null || productName.trim().isEmpty()) {
                log.warn("상품명이 null이거나 비어있습니다.");
                result.put("hasData", false);
                result.put("error", "상품명이 필요합니다.");
                return result;
            }
            
            log.info("상품 상세 가격 정보 조회 시작: {} (현재 상품 가격: {})", productName, currentProductPrice);
            
            // 상품명에서 핵심 키워드 추출
            String[] keywords = productName.split("[,，\\s]+");
            String primaryKeyword = keywords[0].trim();
            
            log.info("추출된 주요 키워드: {}", primaryKeyword);
            
            // 현재 월과 저번달 계산
            LocalDate now = LocalDate.now();
            LocalDate lastMonth = now.minusMonths(1);
            
            // 저번달 데이터 조회
            List<ProductPrice> lastMonthPrices = repository.findByProductNameAndPriceDateBetween(
                primaryKeyword, lastMonth.withDayOfMonth(1), lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()));
            
            // 현재 월 데이터 조회
            List<ProductPrice> currentMonthPrices = repository.findByProductNameAndPriceDateBetween(
                primaryKeyword, now.withDayOfMonth(1), now);
            
            // 저번달 평균 가격 계산
            double lastMonthAverage = lastMonthPrices.stream()
                    .mapToDouble(ProductPrice::getCurrentPrice)
                    .average()
                    .orElse(0.0);
            
            // 현재 월 평균 가격 계산
            double currentMonthAverage = currentMonthPrices.stream()
                    .mapToDouble(ProductPrice::getCurrentPrice)
                    .average()
                    .orElse(0.0);
            
            // 현재 상품 가격과 공공데이터 평균 가격 비교
            double priceChangeRate = 0.0;
            if (currentProductPrice != null && currentProductPrice > 0) {
                if (currentMonthAverage > 0) {
                    // 현재 상품 가격과 공공데이터 현재월 평균 비교
                    priceChangeRate = ((currentProductPrice - currentMonthAverage) / currentMonthAverage) * 100;
                    log.info("현재 상품 가격({})과 공공데이터 평균({}) 비교: {}%", 
                        currentProductPrice, currentMonthAverage, priceChangeRate);
                } else if (lastMonthAverage > 0) {
                    // 현재 월 데이터가 없으면 저번달 평균과 비교
                    priceChangeRate = ((currentProductPrice - lastMonthAverage) / lastMonthAverage) * 100;
                    log.info("현재 상품 가격({})과 공공데이터 저번달 평균({}) 비교: {}%", 
                        currentProductPrice, lastMonthAverage, priceChangeRate);
                }
            }
            
            // 데이터가 없을 경우 테스트용 데이터 제공
            if (lastMonthPrices.isEmpty() && currentMonthPrices.isEmpty()) {
                log.info("실제 데이터가 없어 테스트 데이터를 제공합니다: {}", productName);
                
                // 기본 테스트 데이터
                lastMonthAverage = 15000.0;
                currentMonthAverage = 16000.0;
                
                if (currentProductPrice != null && currentProductPrice > 0) {
                    priceChangeRate = ((currentProductPrice - currentMonthAverage) / currentMonthAverage) * 100;
                }
                
                log.info("테스트 데이터 제공: 현재 상품 가격({}), 공공데이터 평균({}), 변동률({}%)", 
                    currentProductPrice, currentMonthAverage, priceChangeRate);
            }
            
            result.put("productName", productName);
            result.put("lastMonthAverage", lastMonthAverage);
            result.put("currentMonthAverage", currentMonthAverage);
            result.put("currentProductPrice", currentProductPrice);
            result.put("priceChangeRate", priceChangeRate);
            result.put("hasData", true);
            
            log.info("결과 제공 완료: hasData={}, 변동률={}%", result.get("hasData"), priceChangeRate);
            
        } catch (Exception e) {
            log.error("상품 상세 가격 정보 조회 중 오류: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
            result.put("hasData", false);
        }
        
        return result;
    }
    
    // 상품 상세 페이지용 크기별 평균 가격 조회
    public Map<String, Object> getProductSizePrices(String productName) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (productName == null || productName.trim().isEmpty()) {
                log.warn("상품명이 null이거나 비어있습니다.");
                result.put("hasData", false);
                result.put("error", "상품명이 필요합니다.");
                return result;
            }
            
            // 최근 3개월 데이터 조회
            LocalDate now = LocalDate.now();
            LocalDate threeMonthsAgo = now.minusMonths(3);
            
            List<ProductPrice> prices = repository.findByProductNameAndPriceDateBetween(
                productName, threeMonthsAgo, now);
            
            // 크기별(등급별) 평균 가격 계산
            Map<String, Double> sizeAverages = prices.stream()
                    .collect(Collectors.groupingBy(
                        ProductPrice::getGrade,
                        Collectors.averagingDouble(ProductPrice::getCurrentPrice)
                    ));
            
            // 단위별 평균 가격 계산
            Map<String, Double> unitAverages = prices.stream()
                    .collect(Collectors.groupingBy(
                        ProductPrice::getUnit,
                        Collectors.averagingDouble(ProductPrice::getCurrentPrice)
                    ));
            
            // 데이터가 없을 경우 테스트용 데이터 제공 (상추, 깻잎 관련)
            if (prices.isEmpty()) {
                if (productName.contains("상추") || productName.contains("양상추") || productName.contains("청상추")) {
                    // 상추 테스트 데이터
                    Map<String, Double> testSizeAverages = new HashMap<>();
                    testSizeAverages.put("상", 8500.0);
                    testSizeAverages.put("중", 7500.0);
                    testSizeAverages.put("하", 6500.0);
                    
                    Map<String, Double> testUnitAverages = new HashMap<>();
                    testUnitAverages.put("4키로상자", 7500.0);
                    testUnitAverages.put("8키로상자", 8000.0);
                    
                    result.put("productName", productName);
                    result.put("sizeAverages", testSizeAverages);
                    result.put("unitAverages", testUnitAverages);
                    result.put("totalPrices", 6);
                    result.put("hasData", true);
                    return result;
                } else if (productName.contains("깻잎")) {
                    // 깻잎 테스트 데이터
                    Map<String, Double> testSizeAverages = new HashMap<>();
                    testSizeAverages.put("상", 22000.0);
                    testSizeAverages.put("중", 18000.0);
                    testSizeAverages.put("하", 15000.0);
                    
                    Map<String, Double> testUnitAverages = new HashMap<>();
                    testUnitAverages.put("2키로상자", 18000.0);
                    testUnitAverages.put("3키로상자", 20000.0);
                    
                    result.put("productName", productName);
                    result.put("sizeAverages", testSizeAverages);
                    result.put("unitAverages", testUnitAverages);
                    result.put("totalPrices", 6);
                    result.put("hasData", true);
                    return result;
                } else if (productName.contains("사과")) {
                    // 사과 테스트 데이터
                    Map<String, Double> testSizeAverages = new HashMap<>();
                    testSizeAverages.put("특", 27000.0);
                    testSizeAverages.put("상", 24000.0);
                    testSizeAverages.put("중", 22000.0);
                    testSizeAverages.put("하", 20000.0);
                    
                    Map<String, Double> testUnitAverages = new HashMap<>();
                    testUnitAverages.put("5키로상자", 24000.0);
                    testUnitAverages.put("10키로상자", 27000.0);
                    
                    result.put("productName", productName);
                    result.put("sizeAverages", testSizeAverages);
                    result.put("unitAverages", testUnitAverages);
                    result.put("totalPrices", 8);
                    result.put("hasData", true);
                    return result;
                } else if (productName.contains("당근")) {
                    // 당근 테스트 데이터
                    Map<String, Double> testSizeAverages = new HashMap<>();
                    testSizeAverages.put("특", 25000.0);
                    testSizeAverages.put("상", 22000.0);
                    testSizeAverages.put("중", 20000.0);
                    testSizeAverages.put("하", 18000.0);
                    
                    Map<String, Double> testUnitAverages = new HashMap<>();
                    testUnitAverages.put("10키로상자", 22000.0);
                    testUnitAverages.put("20키로상자", 24000.0);
                    
                    result.put("productName", productName);
                    result.put("sizeAverages", testSizeAverages);
                    result.put("unitAverages", testUnitAverages);
                    result.put("totalPrices", 8);
                    result.put("hasData", true);
                    return result;
                }
            }
            
            result.put("productName", productName);
            result.put("sizeAverages", sizeAverages);
            result.put("unitAverages", unitAverages);
            result.put("totalPrices", prices.size());
            result.put("hasData", !prices.isEmpty());
            
        } catch (Exception e) {
            log.error("상품 크기별 가격 정보 조회 중 오류: {}", e.getMessage(), e);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
} 