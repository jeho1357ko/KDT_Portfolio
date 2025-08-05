package com.kh.project.domain.svc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.project.domain.entity.ProductPrice;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PublicDataService {
    
    private static final String API_URL = "http://www.garak.co.kr/homepage/publicdata/dataJsonOpen.do";
    private static final String PASSWORD = "busankh9970!";
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public List<ProductPrice> fetchProductPrices(String date) {
        List<ProductPrice> prices = new ArrayList<>();
        
        try {
            String url = String.format("%s?passwd=%s&pageidx=1&portal.templet=false&p_pos_gubun=1&id=4315&dataid=data58&pagesize=10&s_date=%s&s_deal=211",
                    API_URL, PASSWORD, date);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode resultData = rootNode.get("resultData");
                
                if (resultData != null && resultData.isArray()) {
                    for (JsonNode item : resultData) {
                        ProductPrice price = convertToProductPrice(item, date);
                        if (price != null) {
                            prices.add(price);
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("공공데이터 API 호출 중 오류 발생: {}", e.getMessage(), e);
        }
        
        return prices;
    }
    
    private ProductPrice convertToProductPrice(JsonNode item, String date) {
        try {
            ProductPrice price = new ProductPrice();
            
            // 기본 정보
            price.setProductName(item.get("PUM_NAME").asText());
            price.setGrade(item.get("GRADE_NAME").asText());
            price.setUnit(item.get("UNIT_NAME").asText().trim());
            
            // 가격 정보 (쉼표 제거 후 숫자로 변환)
            String avgStr = item.get("AVG").asText().replace(",", "");
            String preAvg1Str = item.get("PREAVG_1").asText().replace(",", "");
            String preAvg2Str = item.get("PREAVG_2").asText().replace(",", "");
            
            price.setCurrentPrice(Double.parseDouble(avgStr));
            price.setPreviousMonthPrice(Double.parseDouble(preAvg1Str));
            price.setTwoMonthsAgoPrice(Double.parseDouble(preAvg2Str));
            
            // 날짜 정보
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            price.setPriceDate(LocalDate.parse(date, formatter));
            
            // 메타데이터
            price.setSource("공공데이터");
            price.setMarketType("가락");
            price.setCategory("청과");
            
            return price;
            
        } catch (Exception e) {
            log.error("데이터 변환 중 오류: {}", e.getMessage());
            return null;
        }
    }
    
    // 특정 기간의 데이터 가져오기
    public List<ProductPrice> fetchProductPricesForPeriod(String startDate, String endDate) {
        List<ProductPrice> allPrices = new ArrayList<>();
        
        LocalDate start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("yyyyMMdd"));
        LocalDate end = LocalDate.parse(endDate, DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        LocalDate current = start;
        while (!current.isAfter(end)) {
            String dateStr = current.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            List<ProductPrice> prices = fetchProductPrices(dateStr);
            allPrices.addAll(prices);
            
            current = current.plusMonths(1);
        }
        
        return allPrices;
    }
} 