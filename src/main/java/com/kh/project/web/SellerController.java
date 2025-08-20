package com.kh.project.web;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.kh.project.domain.entity.Seller;
import com.kh.project.domain.entity.SellerSales;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.domain.seller.svc.SellerSVC;
import com.kh.project.domain.sellersales.svc.SellerSalesSVC;
import com.kh.project.web.seller.LoginForm;
import com.kh.project.web.seller.LoginSeller;
import com.kh.project.web.seller.MyInformationEdit;
import com.kh.project.web.seller.MyPageForm;
import com.kh.project.web.seller.SaveSeller;
import com.kh.project.web.seller.UpdateSeller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
@Controller
public class SellerController {

  private final SellerSVC sellerSVC;
  private final ProductSVC productSVC;
  private final SellerSalesSVC sellerSalesSVC;


  //판매자 회원 등록 페이지
  @GetMapping("/seller/signup")
  public String signUpPage(Model model) {
    model.addAttribute("sellerSignupForm", new SaveSeller());
    return "seller/seller_signup";
  }

  // 이메일 중복 체크 API
  @GetMapping("/seller/check-email")
  @org.springframework.web.bind.annotation.ResponseBody
  public java.util.Map<String, Boolean> checkEmailDuplicate(@RequestParam String email) {
    java.util.Map<String, Boolean> response = new java.util.HashMap<>();
    response.put("exists", sellerSVC.isExistEmail(email));
    return response;
  }

  // 사업자등록번호 중복 체크 API
  @GetMapping("/seller/check-bizRegNo")
  @org.springframework.web.bind.annotation.ResponseBody
  public java.util.Map<String, Boolean> checkBizRegNoDuplicate(@RequestParam String bizRegNo) {
    java.util.Map<String, Boolean> response = new java.util.HashMap<>();
    Optional<Seller> seller = sellerSVC.bizRegNoBySellerId(bizRegNo);
    boolean exists = seller.isPresent() && !seller.get().getStatus().equals("탈퇴");
    response.put("exists", exists);
    return response;
  }

  //회원가입 처리
  @PostMapping("/seller/signup")
  public String signUpSeller(@ModelAttribute SaveSeller saveSeller, RedirectAttributes redirectAttributes, Model model) {
    Seller seller = new Seller();
    BeanUtils.copyProperties(saveSeller, seller);
    
    // 이메일 중복 체크
    if (sellerSVC.isExistEmail(seller.getEmail())) {
      model.addAttribute("error", "이미 가입된 이메일입니다");
      model.addAttribute("sellerSignupForm", saveSeller);
      return "seller/seller_signup";
    }
    
    // 사업자등록번호 중복 체크
    Optional<Seller> optionalSeller = sellerSVC.bizRegNoBySellerId(seller.getBizRegNo());
    if (optionalSeller.isPresent()){
      Seller seller2 = optionalSeller.get();
      if(!seller2.getStatus().equals("탈퇴")){
        model.addAttribute("error","이미 가입된 사업자 번호입니다");
        model.addAttribute("sellerSignupForm", saveSeller);
        return "seller/seller_signup";
      }
    }
    
    sellerSVC.save(seller);
    
    // 회원가입 성공 메시지 추가
    redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인해주세요!");
    
    return "redirect:/seller/login";
  }

  //판매자 로그인 페이지
  @GetMapping("/seller/login")
  public String sellerLoginPage(Model model) {
    model.addAttribute("loginForm", new LoginForm());
    return "seller/seller_login";
  }

  //판매자 로그인
  @PostMapping("/seller/login")
  public String sellerLogin(@ModelAttribute LoginForm loginForm, HttpServletRequest request, Model model) {

    Optional<Seller> optionalSeller = sellerSVC.findByEmail(loginForm.getEmail());

    if (optionalSeller.isEmpty()) {
      model.addAttribute("error", "존재하지 않는 이메일입니다.");
      return "seller/seller_login";
    }

    Seller seller = optionalSeller.get();

    if (!seller.getPassword().equals(loginForm.getPassword())) {
      model.addAttribute("error", "비밀번호가 일치하지 않습니다.");
      return "seller/seller_login";
    }

    if ("비활성화".equals(seller.getStatus())) {
      model.addAttribute("error", "계정이 비활성화 상태입니다.");
      return "seller/seller_login";
    }
    if ("정지".equals(seller.getStatus())) {
      model.addAttribute("error", "계정이 정지 상태입니다.");
      return "seller/seller_login";
    }
    if ("탈퇴".equals(seller.getStatus())) {
      model.addAttribute("error", "없는 계정입니다.");

      return "seller/seller_login";
    }
    HttpSession session = request.getSession(true);

    LoginSeller loginSeller = new LoginSeller(
        seller.getSellerId(),
        seller.getEmail(),
        seller.getShopName(),
        seller.getName()
    );

    session.setAttribute("loginSeller", loginSeller);
    return "redirect:/seller/main/" + seller.getSellerId();
  }

  // 로그인 후 화면
  @GetMapping("/seller/main/{sid}")
  public String sellerPage(@PathVariable(value = "sid") Long sid , Model model, HttpSession session){
    // 세션에서 로그인한 판매자 정보 가져오기
    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");
    
    if (loginSeller != null) {
      model.addAttribute("name", loginSeller.getName());
    } else {
      // 세션이 없을 때 데이터베이스에서 직접 조회
      try {
        Optional<Seller> sellerOpt = sellerSVC.findBySellerId(sid);
        if (sellerOpt.isPresent()) {
          String sellerName = sellerOpt.get().getName();
          model.addAttribute("name", sellerName);
        } else {
          model.addAttribute("name", "알 수 없음");
        }
      } catch (Exception e) {
        model.addAttribute("name", "오류");
      }
    }
    
    SellerSales sellerSales1 = sellerSalesSVC.totalOrder(sid);
    SellerSales sellerSales2 = sellerSalesSVC.totalPrice(sid);
    List<SellerSales> list1 = sellerSalesSVC.top3Order(sid);
    List<SellerSales> list2 = sellerSalesSVC.top3Price(sid);
    model.addAttribute("totalOrder",sellerSales1);
    model.addAttribute("totalPrice",sellerSales2);
    model.addAttribute("top3Order",list1);
    model.addAttribute("top3Price",list2);
    model.addAttribute("sellerId",sid);
    return "seller/seller_dashboard";
  }




  // 로그아웃
  @PostMapping("/seller/logout") // POST http://localhost:9080/logout
  public String logout(HttpServletRequest request) {

    // 1) 세션정보 가져오기
    HttpSession session = request.getSession(false);

    // 2) 세션 제거
    if (session != null) {
      session.invalidate();
    }

    // 3) 로그아웃 후 로그인 페이지로 리다이렉트
    return "redirect:/home"; //
  }

  //회원 정보  조회
  @GetMapping("/seller/myPage/{sid}")
  public String myPage( HttpSession session , Model model,@PathVariable(value = "sid") Long sid){
    // 세션에 저장된 정보를 담은 loginSeller 라는 객체를  LoginSeller 객체에 담아 loginSeller 라는 이름으로 꺼냄
    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");

    if (loginSeller == null) {
      return "redirect:/seller/login"; // 또는 접근 거부 페이지로
    }

    if (!loginSeller.getSellerId().equals(sid)) {
      model.addAttribute("error","접근 권한이 없습니다.");
      return "error/forbidden"; // 또는 오류 메시지
    }
    Optional<Seller> seller = sellerSVC.findByEmail(loginSeller.getEmail());
    if (seller.isPresent()){

      Seller seller2 = seller.get();

      MyPageForm myPageForm = new MyPageForm();

      BeanUtils.copyProperties(seller2,myPageForm);

      model.addAttribute("myInfo",myPageForm);
      model.addAttribute("sellerId",sid);
      model.addAttribute("name", seller2.getName());
      return "seller/seller_info";}
    else {
      session.invalidate();
      return "redirect:/seller/login";
    }
  }
  // 회원 정보 수정
  @GetMapping("/seller/myPage/{sid}/edit")
  public String myInformationEdit(@PathVariable(value = "sid") Long sid, HttpSession session, Model model) {
    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");

    if (loginSeller == null) {
      return "redirect:/seller/login"; // 또는 접근 거부 페이지로
    }

    if (!loginSeller.getSellerId().equals(sid)) {
      model.addAttribute("error", "접근 권한이 없습니다.");
      return "error/forbidden";
    }

    Optional<Seller> optionalSeller = sellerSVC.findByEmail(loginSeller.getEmail());
    if (optionalSeller.isPresent()) {
      Seller seller = optionalSeller.get();
      MyInformationEdit myInformationEdit = new MyInformationEdit();
      BeanUtils.copyProperties(seller, myInformationEdit);
      model.addAttribute("myInformationEdit", myInformationEdit);
      model.addAttribute("sellerId",sid);
      model.addAttribute("name", seller.getName());
      return "seller/seller_edit";
    } else {
      session.invalidate();
      return "redirect:/seller/login";
    }
  }

  //회원 정보 수정 처리
  @PostMapping("/seller/myPage/{sid}/edit")
  public String update(HttpSession session,
                       @ModelAttribute UpdateSeller updateSeller,
                       RedirectAttributes redirectAttributes,
                       Model model,
                       @PathVariable(value = "sid") Long sid) {

    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");
    if (!loginSeller.getSellerId().equals(sid)) {
      model.addAttribute("error", "접근 권한이 없습니다.");
      return "error/forbidden";
    }

    Seller seller = new Seller();
    BeanUtils.copyProperties(updateSeller, seller);
    seller.setSellerId(sid); // PK 명시

    int i = sellerSVC.update(sid, seller);

    if (i == 1) {
      redirectAttributes.addFlashAttribute("msg", "정보 수정 완료");
      return "redirect:/seller/myPage/" + sid;
    } else {
      model.addAttribute("error", "오류 수정 실패");
      return "seller/seller_edit";  // 실패 시 다시 수정 페이지 보여주는 게 자연스러움
    }
  }


  // 회원 탈퇴 페이지
  @GetMapping("/seller/{sid}/delete")
  public String deletePage(@PathVariable(value = "sid") Long sid , HttpSession httpSession, Model model) {
    LoginSeller loginseller = (LoginSeller) httpSession.getAttribute("loginSeller");
    if (!loginseller.getSellerId().equals(sid)) {
      model.addAttribute("error", "잘못된 접근 입니다.");
      return "error/forbidden";
    }
    return "seller/deletePage";
  }
  //회원 탈퇴 요청 처리
  @PostMapping("/seller/{sid}/delete")
  public String delete(@PathVariable(value = "sid") Long sid , HttpSession session , RedirectAttributes redirectAttributes , Model model){
    LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");

    if (loginSeller == null || !loginSeller.getSellerId().equals(sid)){
      session.invalidate();
      model.addAttribute("error","잘못된 접근 입니다.");
      return "error/forbidden";
    }
    
    try {
      int i = sellerSVC.delete(sid);

      if (i != 1){
        model.addAttribute("error"," 회원 탈퇴 처리 중 오류가 발생했습니다. ");
        return "redirect:/seller/myPage/" + sid;
      }else {
        session.invalidate();
        redirectAttributes.addFlashAttribute("msg", "회원 탈퇴가 완료되었습니다. 등록하신 모든 상품이 비활성화 처리되었습니다.");
        return "redirect:/home";
      }
    } catch (Exception e) {
      log.error("판매자 탈퇴 처리 중 오류 발생: sellerId={}", sid, e);
      model.addAttribute("error"," 회원 탈퇴 처리 중 오류가 발생했습니다. ");
      return "redirect:/seller/myPage/" + sid;
    }
  }

}
