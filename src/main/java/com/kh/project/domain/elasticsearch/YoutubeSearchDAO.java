package com.kh.project.domain.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.kh.project.domain.entity.Youtube;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class YoutubeSearchDAO {
  private SortOrder sortOrder = SortOrder.Desc;
  final private ElasticsearchClient esClient;

  public List<Youtube> search(String keyword, int from, int size) {
    try {
      // 1) 제목 정확도 높이고 싶으면 match_phrase 권장
      Query titleQuery = Query.of(q -> q.matchPhrase(m -> m
          .field("title")
          .query(keyword)
      ));



      Query boolQuery = Query.of(q -> q.bool(b -> b.must(titleQuery)));

      var response = esClient.search(s -> {
            s.index("youtube")
                .from(from)
                .size(size)
                .query(boolQuery)
                .sort(sort -> sort.field(f -> f.field("upload_date").order(sortOrder)));
            return s;
          },
          Youtube.class
      );

      return response.hits().hits().stream()
          .map(hit -> hit.source())
          .filter(src -> src != null)  // NPE 방지
          .toList();

    } catch (IOException e) {

      log.error("YouTube 검색 중 IOException 발생. keyword={}, from={}, size={}", keyword, from, size, e);
      return Collections.emptyList();
    } catch (Exception e) {

      log.error("YouTube 검색 중 알 수 없는 오류 발생. keyword={}, from={}, size={}", keyword, from, size, e);
      return Collections.emptyList();
    }
  }
}


