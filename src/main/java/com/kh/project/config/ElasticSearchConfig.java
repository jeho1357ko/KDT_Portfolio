package com.kh.project.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@Configuration
public class ElasticSearchConfig {

  @Value("${elasticsearch.host}")
  private String host;


  @Value("${elasticsearch.port}")
  private int port;

  @Value("${elasticsearch.scheme}")
  private String scheme;

  @Bean
  public RestClient restClient() {
    log.info("host : {}" ,host);
    log.info("port : {}" ,port);
    log.info("scheme : {}" ,scheme);
    return RestClient.builder(
        new HttpHost(host, port, scheme)
    ).build();
  }

  @Bean
  public ElasticsearchTransport elasticsearchTransport(RestClient restClient) {
    // ObjectMapper에 JSR310 모듈 추가
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    
    JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper(objectMapper);
    
    return new RestClientTransport(restClient, jsonpMapper);
  }

  @Bean
  public ElasticsearchClient elasticsearchClient(ElasticsearchTransport transport) {
    return new ElasticsearchClient(transport);
  }
} 