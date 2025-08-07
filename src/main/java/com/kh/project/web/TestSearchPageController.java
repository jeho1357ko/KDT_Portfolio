package com.kh.project.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
//@RequestMapping("/test")
public class TestSearchPageController {
  @GetMapping("/search")
  public String search(@RequestParam("keyword") String keyword, Model model) {
    model.addAttribute("keyword", keyword);
    return "product/search";
  }
} 