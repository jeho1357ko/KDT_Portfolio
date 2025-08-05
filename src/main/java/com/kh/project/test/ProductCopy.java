package com.kh.project.test;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
public class ProductCopy {

  final private ProductSVC productSVC;
  final private ElasticsearchClient esClient;

  @PostMapping("/test/copy/db")
  public void copy() throws IOException {

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


  }
} 