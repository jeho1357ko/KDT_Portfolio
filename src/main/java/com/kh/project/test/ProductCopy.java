package com.kh.project.test;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.analysis.CustomAnalyzer;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
public class ProductCopy {

  private final ProductSVC productSVC;
  private final ElasticsearchClient esClient;

  @PostMapping("/test/copy/db")
  @ResponseBody
  public String copyAndReindex() {
    StringBuilder logMsg = new StringBuilder();

    try {
      // 1. 기존 인덱스 삭제
      try {
        esClient.indices().delete(d -> d.index("product"));
        logMsg.append("✅ 기존 'product' 인덱스 삭제 완료\n");
      } catch (Exception e) {
        logMsg.append("⚠ 기존 인덱스 없음 또는 삭제 실패: ").append(e.getMessage()).append("\n");
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
      logMsg.append("✅ 새 인덱스 생성 완료 (my_custom_analyzer 포함)\n");

      // 3. DB → ES 데이터 복사 (Bulk)
      List<Product> list = productSVC.allProduct();
      BulkRequest.Builder br = new BulkRequest.Builder();

      for (Product p : list) {
        br.operations(op -> op
            .index(idx -> idx
                .index("product")
                .id(p.getProductId().toString())
                .document(p)
            )
        );
      }

      esClient.bulk(br.build());
      logMsg.append("✅ 총 ").append(list.size()).append("개 상품 재색인 완료\n");

    } catch (IOException e) {
      log.error("❌ 재색인 중 오류", e);
      logMsg.append("❌ 오류 발생: ").append(e.getMessage()).append("\n");
    }

    return logMsg.toString();
  }
}