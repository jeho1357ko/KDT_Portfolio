package com.kh.project.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.seller.LoginSeller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
//@RequestMapping("/test")
public class TestSearchPageController {
  @GetMapping("/search")
  public String search(@RequestParam("keyword") String keyword, Model model, HttpServletRequest request) {
    model.addAttribute("keyword", keyword);
    
    // 로그인 상태 처리
    HttpSession session = request.getSession(false);
    if (session != null) {
      // 구매자 로그인 상태 확인
      LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
      if (loginBuyer != null) {
        model.addAttribute("nickname", loginBuyer.getNickname());
        model.addAttribute("buyerId", loginBuyer.getBuyerId());
      }
      
      // 판매자 로그인 상태 확인
      LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");
      if (loginSeller != null) {
        model.addAttribute("nickname", loginSeller.getName());
        model.addAttribute("sellerId", loginSeller.getSellerId());
      }
    }
    
    return "product/search";
  }
  @GetMapping("review")
  public String review() {return "product/review";}
} 