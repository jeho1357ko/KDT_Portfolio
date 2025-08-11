package com.kh.project.domain.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.analysis.CustomAnalyzer;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.dao.ProductDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElasticsearchReindexService {

  private final ElasticsearchClient esClient;
  private final ProductDAO productDAO; // DB 조회용

  /**
   * product 인덱스 재생성 + DB 데이터 재색인
   */
  public void recreateIndexAndReindex() throws IOException {
    // 1. 기존 인덱스 삭제
    try {
      esClient.indices().delete(d -> d.index("product"));
      log.info("✅ 기존 product 인덱스 삭제 완료");
    } catch (Exception e) {
      log.warn("⚠ 기존 product 인덱스 삭제 중 오류 (없거나 이미 삭제됨): {}", e.getMessage());
    }

    // 2. 새 인덱스 생성 (my_custom_analyzer 포함)
    esClient.indices().create(c -> c
        .index("product")
        .settings(s -> s
            .analysis(a -> a
                .analyzer("my_custom_analyzer", an -> an
                    .custom(new CustomAnalyzer.Builder()
                        .tokenizer("nori_tokenizer")
                        .filter("lowercase", "nori_readingform", "nori_part_of_speech")
                        .build()
                    )
                )
            )
        )
        .mappings(m -> m
            .properties("productId", p -> p.long_(l -> l))
            .properties("sellerId", p -> p.long_(l -> l))
            .properties("title", p -> p.text(t -> t.analyzer("my_custom_analyzer")))
            .properties("productName", p -> p.text(t -> t.analyzer("my_custom_analyzer")))
            .properties("price", p -> p.long_(l -> l))
            .properties("deliveryMethod", p -> p.keyword(k -> k))
            .properties("countryOfOrigin", p -> p.keyword(k -> k))
            .properties("status", p -> p.keyword(k -> k))
            .properties("cdate", p -> p.date(d -> d))
        )
    );
    log.info("✅ 새 product 인덱스 생성 완료");

    // 3. DB → ES 데이터 재색인
    List<Product> products = productDAO.allProduct();
    for (Product product : products) {
      esClient.index(i -> i
          .index("product")
          .id(String.valueOf(product.getProductId()))
          .document(product)
      );
    }
    log.info("✅ 총 {}개 상품을 Elasticsearch에 재색인 완료", products.size());
  }
}
