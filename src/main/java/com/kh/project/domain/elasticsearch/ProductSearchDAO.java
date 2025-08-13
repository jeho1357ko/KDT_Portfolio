package com.kh.project.domain.elasticsearch;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.kh.project.domain.entity.Product;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.json.JsonData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ProductSearchDAO {

  final private ElasticsearchClient esClient;

  //일반 검색 함수
  public List<Product> search(String keyword, String status, Integer minPrice, Integer maxPrice,
                              String sortScore, String sortDate, int from, int size) {

    log.info("keyword: {}", keyword);
    log.info("status: {}", status);
    double safeMin = minPrice != null ? minPrice : 0.0;
    double safeMax = maxPrice != null ? maxPrice : 1000000000.0;

    SortOrder scoreOrder = "desc".equalsIgnoreCase(sortScore) ? SortOrder.Desc : SortOrder.Asc;
    SortOrder dateOrder = "desc".equalsIgnoreCase(sortDate) ? SortOrder.Desc : SortOrder.Asc;

    log.info("safeMin: {}", safeMin);
    log.info("safeMax: {}", safeMax);

    try {
      //  키워드 유효성 판단 (null, 공백, 길이)
      boolean hasKeyword = keyword != null && !keyword.isBlank();
      Query matchQuery = null;

      if (hasKeyword) {
        String key = keyword.trim();
        String fuzz = (key.length() <= 2) ? "1" : "AUTO";
        
        matchQuery = Query.of(q -> q
            .match(m -> m
                .field("title")
                .query(key).analyzer("my_custom_analyzer").fuzziness(fuzz)
            )
        );
        log.info("매치쿼리 : {}",matchQuery);
      }

      // 가격 범위 쿼리
      Query rangeQuery = Query.of(q -> q
          .range(r -> r
              .number(nr -> nr
                  .field("price")
                  .gte(safeMin)
                  .lte(safeMax)
              )
          )
      );

      // 상태 필터
      List<Query> filters = new ArrayList<>();
      filters.add(rangeQuery);
      
      // 비활성화된 상품 제외
      filters.add(Query.of(q -> q
          .bool(b -> b
              .mustNot(m -> m
                  .term(t -> t
                      .field("status")
                      .value("비활성화")
                  )
              )
          )
      ));
      
      // 추가 상태 필터 (사용자가 지정한 경우)
      if (status != null && !status.isBlank()) {
        filters.add(Query.of(q -> q
            .term(t -> t
                .field("status")
                .value(status)
            )
        ));
      }

      // Bool 쿼리 조립
      BoolQuery.Builder boolBuilder = new BoolQuery.Builder();
      if (matchQuery != null) {
        boolBuilder.must(matchQuery);
      }
      boolBuilder.filter(filters);

      Query boolQuery = Query.of(q -> q.bool(boolBuilder.build()));
      log.info(" boolQuery: {}", boolQuery);

      //  _score 정렬 여부
      boolean useScoreSort = matchQuery != null;

      // 검색 실행
      var response = esClient.search(s -> {
        s.index("product")
            .query(boolQuery)
            .from(from)
            .size(size);

        //  _score 정렬은 keyword 있을 때만
        if (useScoreSort) {
          s.sort(sort1 -> sort1
              .field(f -> f
                  .field("_score")
                  .order(scoreOrder)
              )
          );
        }

        //  항상 cdate 정렬
        s.sort(sort2 -> sort2
            .field(f -> f
                .field("cdate")
                .order(dateOrder)
            )
        );

        // 하이라이팅
        s.highlight(h -> h
            .fields("title", f -> f
                .preTags("<span style='color:red'>")
                .postTags("</span>")
            )
        );

        return s;
      }, Product.class);

      log.info(" total hits: {}", response.hits().total().value());

      return response.hits().hits().stream()
          .map(hit -> hit.source())
          .toList();

    } catch (Exception e) {
      log.error(" ElasticsearchException: {}", e.getMessage());
      if (e instanceof co.elastic.clients.elasticsearch._types.ElasticsearchException esEx) {
        log.error(" ES error details: {}", esEx.error());
      }
      e.printStackTrace();
      return List.of();
    }
  } //search 함수 끝

  // 삭제 함수
  public void delete(Long productId) throws IOException {

    try {
      Query termQuery = Query.of(q -> q
          .term(t -> t.field("productId").value(productId)));

      var response = esClient.deleteByQuery(d -> d.index("product").query(termQuery));

      if (response.deleted() != 1) {
        log.warn("삭제된 문서 수가 예상과 다름: {}", response.deleted());
      }

    } catch (IOException e) {
      log.error("Elasticsearch 삭제 중 오류 발생", e);
    }
  } // 삭제 함수 끝

  // 수정 함수
  public void update (Product product , Long pid) throws IOException{
    Query termQuery = Query.of(q -> q.term(t -> t.field("productId").value(pid)));

    Map<String, JsonData> params = new HashMap<>();
    params.put("newProductName", JsonData.of(product.getProductName()));
    params.put("newTitle", JsonData.of(product.getTitle()));
    params.put("newContent", JsonData.of(product.getContent()));
    params.put("newPrice", JsonData.of(product.getPrice()));
    params.put("newDeliveryMethod", JsonData.of(product.getDeliveryMethod()));
    params.put("newCountryOfOrigin", JsonData.of(product.getCountryOfOrigin()));
    params.put("newStatus", JsonData.of(product.getStatus()));
    params.put("newDeliveryFee", JsonData.of(product.getDeliveryFee()));
    params.put("newDeliveryInformation", JsonData.of(product.getDeliveryInformation()));
    params.put("newQuantity", JsonData.of(product.getQuantity()));
    params.put("newThumbnail", JsonData.of(product.getThumbnail()));
    params.put("newUdate", JsonData.of(LocalDateTime.now().toString()));

    try {
      var response = esClient.updateByQuery(u -> u
          .index("product")
          .query(termQuery)
          .script(s ->s.lang("painless").source("""
        ctx._source.productName = params.newProductName;
        ctx._source.title = params.newTitle;
        ctx._source.content = params.newContent;
        ctx._source.price = params.newPrice;
        ctx._source.deliveryMethod = params.newDeliveryMethod;
        ctx._source.countryOfOrigin = params.newCountryOfOrigin;
        ctx._source.status = params.newStatus;
        ctx._source.deliveryFee = params.newDeliveryFee;
        ctx._source.deliveryInformation = params.newDeliveryInformation;
        ctx._source.quantity = params.newQuantity;
        ctx._source.thumbnail = params.newThumbnail;
        ctx._source.udate = params.newUdate; 
      """).params(params)
          )
      );

    if (!response.failures().isEmpty()) {
      System.err.println("Elasticsearch updateByQuery 일부 실패: " + response.failures());
    } else {
      System.out.println("수정 완료: " + response.updated() + "건");
    }

  } catch (
  ElasticsearchException e) {
    System.err.println("ES 통신 에러: " + e.getMessage());
  } catch (IOException e) {
    System.err.println("입출력 에러: " + e.getMessage());
  }


  }


} 