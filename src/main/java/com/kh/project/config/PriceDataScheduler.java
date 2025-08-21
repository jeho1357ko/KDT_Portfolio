package com.kh.project.config;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.kh.project.domain.svc.PriceComparisonService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class PriceDataScheduler {
    
    @Autowired
    private PriceComparisonService priceComparisonService;
    

    
    // 매일 새벽 2시에 가격 데이터 동기화
    @Scheduled(cron = "0 0 2 * * ?")
    public void syncPriceDataDaily() {
        try {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            log.info("일일 가격 데이터 동기화 시작: {}", today);
            
            priceComparisonService.syncPublicData(today);
            
            log.info("일일 가격 데이터 동기화 완료: {}", today);
        } catch (Exception e) {
            log.error("일일 가격 데이터 동기화 중 오류: {}", e.getMessage(), e);
        }
    }
    

    

    
    // 매주 일요일 새벽 4시에 전체 데이터 정리 및 백업
    @Scheduled(cron = "0 0 4 ? * SUN")
    public void cleanupPriceDataWeekly() {
        try {
            log.info("주간 가격 데이터 정리 시작");
            
            // 3개월 이상 된 데이터 정리
            LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
            log.info("3개월 이상 된 데이터 정리: {}", threeMonthsAgo);
            
            log.info("주간 가격 데이터 정리 완료");
        } catch (Exception e) {
            log.error("주간 가격 데이터 정리 중 오류: {}", e.getMessage(), e);
        }
    }
} 