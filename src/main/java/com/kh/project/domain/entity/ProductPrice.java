package com.kh.project.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDate;

@Data
@Document(indexName = "product_prices")
public class ProductPrice {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "standard")
    private String productName; // 품목명 (가지, 감귤 등)
    
    @Field(type = FieldType.Text)
    private String grade; // 등급 (상, 중, 하, 특)
    
    @Field(type = FieldType.Text)
    private String unit; // 단위 (5키로상자, 8키로상자 등)
    
    @Field(type = FieldType.Double)
    private Double currentPrice; // 현재 가격 (AVG)
    
    @Field(type = FieldType.Double)
    private Double previousMonthPrice; // 전월 가격 (PREAVG_1)
    
    @Field(type = FieldType.Double)
    private Double twoMonthsAgoPrice; // 전전월 가격 (PREAVG_2)
    
    @Field(type = FieldType.Date)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate priceDate; // 가격 기준일
    
    @Field(type = FieldType.Text)
    private String source; // 데이터 출처 (공공데이터, 홈쇼핑 등)
    
    @Field(type = FieldType.Text)
    private String marketType; // 시장 구분 (가락, 양곡, 강서)
    
    @Field(type = FieldType.Text)
    private String category; // 카테고리 (청과, 수산, 축산)
    
    // 가격 변동률 계산
    @JsonIgnore
    public Double getPriceChangeRate() {
        if (previousMonthPrice != null && previousMonthPrice > 0) {
            return ((currentPrice - previousMonthPrice) / previousMonthPrice) * 100;
        }
        return null;
    }
    
    // 전전월 대비 변동률
    @JsonIgnore
    public Double getTwoMonthsChangeRate() {
        if (twoMonthsAgoPrice != null && twoMonthsAgoPrice > 0) {
            return ((currentPrice - twoMonthsAgoPrice) / twoMonthsAgoPrice) * 100;
        }
        return null;
    }
} 