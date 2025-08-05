package com.kh.project.web;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.seller.LoginSeller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class HomeController {

  final private ProductSVC productSVC;

  // 로그인 선택 페이지
  @GetMapping("/common/select_login")
  public String showLoginSelectPage() {
    return "common/select_login";
  }

  // 회원 가입 선택 페이지
  @GetMapping("/common/select_signup")
  public String showSignUpSelectPage() {
    return "common/select_signup";
  }

  // 홈 페이지
  @GetMapping("/home")
  public String homePage(HttpServletRequest request, Model model) {
    List<Product> products = productSVC.allProduct();
    model.addAttribute("products", products);

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

    return "home";
  }
}

