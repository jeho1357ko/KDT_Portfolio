package com.kh.project.web;

import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.project.domain.entity.Seller;
import com.kh.project.domain.seller.svc.SellerSVC;
import com.kh.project.web.seller.LoginSeller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerPasswordController {

  final private SellerSVC sellerSVC;

  // 비밀번호 확인
  @PostMapping("/check-password")
  @ResponseBody
  public Map<String, Object> checkPassword(@RequestBody Map<String, String> body, HttpSession session) {
    String inputPassword = body.get("password");

    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");
    if (loginSeller == null) {
      return Map.of("success", false, "message", "로그인 정보가 없습니다.");
    }

    // DB에서 해당 판매자 정보 조회
    Optional<Seller> optionalSeller = sellerSVC.findBySellerId(loginSeller.getSellerId());
    if (optionalSeller.isEmpty()) {
      return Map.of("success", false, "message", "판매자 정보가 없습니다.");
    }

    Seller seller = optionalSeller.get();

    // 비밀번호 비교 (암호화 X)
    boolean matched = inputPassword.equals(seller.getPassword());

    return Map.of("success", matched);
  }

}
