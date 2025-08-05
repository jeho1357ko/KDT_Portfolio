package com.kh.project.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/test")
public class TestSearchPageController {
  @GetMapping("/search")
  public String testSearch(){
    return "product/search";
  }
} 