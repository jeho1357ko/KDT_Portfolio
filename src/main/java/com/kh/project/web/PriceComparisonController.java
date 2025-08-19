package com.kh.project.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.kh.project.domain.entity.ProductPrice;
import com.kh.project.domain.svc.PriceComparisonService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/price")
public class PriceComparisonController {
    
    @Autowired
    private PriceComparisonService priceComparisonService;
    
    // 가격 비교 페이지
    @GetMapping("/compare")
    public String priceComparePage() {
        return "price/compare";
    }
    
    // 가격 검색 페이지
    @GetMapping("/search")
    public String priceSearchPage() {
        return "price/search";
    }
    
    // 관리자 페이지
    @GetMapping("/admin")
    public String priceAdminPage() {
        return "price/admin";
    }
    
    // 최신 가격 정보 조회
    @GetMapping("/api/latest")
    @ResponseBody
    public ResponseEntity<List<ProductPrice>> getLatestPrices() {
        try {
            List<ProductPrice> prices = priceComparisonService.getLatestPrices();
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            log.error("최신 가격 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 상품별 가격 비교
    @GetMapping("/api/compare/{productName}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> compareProductPrices(@PathVariable(value = "productName") String productName) {
        try {
            Map<String, Object> result = priceComparisonService.compareProductPrices(productName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("가격 비교 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 상품별 최신 가격 조회
    @GetMapping("/api/product/{productName}")
    @ResponseBody
    public ResponseEntity<List<ProductPrice>> getLatestPricesByProduct(@PathVariable(value = "productName") String productName) {
        try {
            List<ProductPrice> prices = priceComparisonService.getLatestPricesByProduct(productName);
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            log.error("상품별 가격 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 가격 변동 추이 조회
    @GetMapping("/api/trend/{productName}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPriceTrend(
            @PathVariable(value = "productName") String productName,
            @RequestParam(value = "months", defaultValue = "6") int months) {
        try {
            Map<String, Object> result = priceComparisonService.getPriceTrend(productName, months);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("가격 변동 추이 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 데이터 동기화 (관리자용)
    @PostMapping("/api/sync")
    @ResponseBody
    public ResponseEntity<String> syncPublicData(@RequestParam(value = "date") String date) {
        try {
            priceComparisonService.syncPublicData(date);
            return ResponseEntity.ok("데이터 동기화 완료");
        } catch (Exception e) {
            log.error("데이터 동기화 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("동기화 실패: " + e.getMessage());
        }
    }
    
    // 특정 상품 가격 데이터 동기화 (관리자용)
    @PostMapping("/api/sync/product/{productName}")
    @ResponseBody
    public ResponseEntity<String> syncProductPriceData(@PathVariable(value = "productName") String productName) {
        try {
            // 현재 날짜로 공공데이터 조회
            String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            priceComparisonService.syncPublicData(currentDate);
            
            return ResponseEntity.ok("상품 '" + productName + "' 가격 데이터 동기화 완료");
        } catch (Exception e) {
            log.error("상품 가격 데이터 동기화 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("동기화 실패: " + e.getMessage());
        }
    }
    
    // 수동으로 스케줄러 실행 (관리자용)
    @PostMapping("/api/sync/manual")
    @ResponseBody
    public ResponseEntity<String> manualSync() {
        try {
            String currentDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            log.info("수동 가격 데이터 동기화 시작: {}", currentDate);
            
            priceComparisonService.syncPublicData(currentDate);
            
            log.info("수동 가격 데이터 동기화 완료: {}", currentDate);
            return ResponseEntity.ok("수동 가격 데이터 동기화 완료");
        } catch (Exception e) {
            log.error("수동 가격 데이터 동기화 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("동기화 실패: " + e.getMessage());
        }
    }
    
    // 상품 검색
    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<List<ProductPrice>> searchProducts(
            @RequestParam(value = "productName", required = false) String productName,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "category", required = false) String category) {
        try {
            List<ProductPrice> prices = priceComparisonService.searchProducts(productName, grade, category);
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            log.error("상품 검색 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 가격 비교 결과 페이지
    @GetMapping("/result/{productName}")
    public String priceCompareResult(@PathVariable(value = "productName") String productName, Model model) {
        try {
            Map<String, Object> result = priceComparisonService.compareProductPrices(productName);
            model.addAttribute("result", result);
            model.addAttribute("productName", productName);
        } catch (Exception e) {
            log.error("가격 비교 결과 조회 중 오류: {}", e.getMessage());
            model.addAttribute("error", e.getMessage());
        }
        return "price/result";
    }
    
    // 상품 상세 페이지용 가격 정보 조회 (저번달 평균 가격)
    @GetMapping("/api/detail/{productName}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProductDetailPrices(
            @PathVariable(value = "productName") String productName,
            @RequestParam(value = "currentPrice", required = false) Double currentPrice) {
        try {
            Map<String, Object> result = priceComparisonService.getProductDetailPrices(productName, currentPrice);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("상품 상세 가격 정보 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 상품 상세 페이지용 크기별 평균 가격 조회
    @GetMapping("/api/detail/{productName}/sizes")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProductSizePrices(@PathVariable(value = "productName") String productName) {
        try {
            Map<String, Object> result = priceComparisonService.getProductSizePrices(productName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("상품 크기별 가격 정보 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 매칭 가능한 상품명 검색 API
    @GetMapping("/api/products/matching")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchMatchingProducts(@RequestParam(value = "name") String name) {
        try {
            log.info("매칭 상품명 검색: {}", name);
            
            List<String> matchingProducts = priceComparisonService.findMatchingProductNames(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("matchingProducts", matchingProducts);
            response.put("searchTerm", name);
            response.put("count", matchingProducts.size());
            
            log.info("매칭 상품 {}개 발견: {}", matchingProducts.size(), matchingProducts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("매칭 상품 검색 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
} 