package com.kh.project.web;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.kh.project.domain.buyer.svc.BuyerSVC;
import com.kh.project.domain.entity.Buyer;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.buyer.SignUpForm;
import com.kh.project.web.buyer.UpdateForm;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/buyer")
public class BuyerController {

  final private BuyerSVC buyerSVC;

  // 회원 가입 페이지
  @GetMapping("/signup")
  public String signUpPage(Model model) {
    model.addAttribute("buyer", new SignUpForm());
    return "buyer/buyer_signup";
  }

  // 이메일 중복 체크 API
  @GetMapping("/check-email")
  @ResponseBody
  public Map<String, Boolean> checkEmailDuplicate(@RequestParam String email) {
    Map<String, Boolean> response = new java.util.HashMap<>();
    response.put("exists", buyerSVC.isExistEmail(email));
    return response;
  }

  // 회원 가입 요청 처리
  @PostMapping("/signup")
  public String signUp(@Valid @ModelAttribute("buyer") SignUpForm form,
                       BindingResult bindingResult,
                       RedirectAttributes redirectAttributes) {

    // 2. 유효성 검사 실패 시 다시 폼 보여주기
    if (bindingResult.hasErrors()) {
      return "buyer/buyer_signup";
    }

    // 3. 추가 비즈니스 로직 검증
    // 이메일 중복 확인
    Optional<Buyer> existingBuyer = buyerSVC.findByEmail(form.getEmail());
    if (existingBuyer.isPresent()) {
      bindingResult.rejectValue("email", "email.duplicate", "이미 사용 중인 이메일입니다.");
      return "buyer/buyer_signup";
    }



    // 생년월일 형식 검증
    try {
      LocalDate.parse(form.getBirth());
    } catch (Exception e) {
      bindingResult.rejectValue("birth", "birth.invalid", "생년월일 형식이 잘못되었습니다.");
      return "buyer/buyer_signup";
    }

    // 3. 엔티티로 변환
    Buyer buyer = new Buyer();
    buyer.setEmail(form.getEmail());
    buyer.setPassword(form.getPassword()); // 실제 서비스에서는 반드시 암호화
    buyer.setName(form.getName());
    buyer.setNickname(form.getNickname());
    buyer.setTel(form.getTel());
    buyer.setGender(form.getGender());

    // 날짜 변환
    try {
      buyer.setBirth(java.sql.Date.valueOf(form.getBirth())); // 'yyyy-MM-dd' 형식일 경우
    } catch (Exception e) {
      bindingResult.rejectValue("birth", "birth.invalid", "생년월일 형식이 잘못되었습니다.");
      return "buyer/buyer_signup";
    }

    buyer.setPostNumber(Long.valueOf(form.getPostNumber()));
    String fullAddress = form.getAddress();
    if (form.getDetailAddress() != null && !form.getDetailAddress().isBlank()) {
      fullAddress += " " + form.getDetailAddress();
    }
    buyer.setAddress(fullAddress);

    // 4. DB 저장
    buyerSVC.save(buyer);

    // 5. 성공 메시지 전달
    redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다. 로그인 해주세요!");

    return "redirect:/buyer/login";
  }

  // 로그인 화면
  @GetMapping("/login")
  public String loginPage() {
    return "buyer/buyer_login";
  }

  //로그인 요청 처리
  @PostMapping("/login")
  public String login(@ModelAttribute LoginForm loginForm,
                      RedirectAttributes redirectAttributes,
                      HttpServletRequest request,
                      Model model) {

    String email = loginForm.getEmail();
    Optional<Buyer> optionalBuyer = buyerSVC.findByEmail(email);

    if (optionalBuyer.isEmpty()) {

      model.addAttribute("error", "존재하지 않는 이메일입니다.");
      return "buyer/buyer_login";
    }

    Buyer buyer = optionalBuyer.get();


    if (!buyer.getPassword().equals(loginForm.getPassword())) {
      System.out.println("비밀번호 불일치");
      model.addAttribute("error", "비밀번호가 일치하지 않습니다.");
      return "buyer/buyer_login";
    }

    if ("비활성화".equals(buyer.getStatus())) {
      System.out.println("계정 비활성화 상태");
      model.addAttribute("error", "계정이 비활성화 상태입니다.");
      return "buyer/buyer_login";
    }

    if ("정지".equals(buyer.getStatus())) {
      System.out.println("계정 정지 상태");
      model.addAttribute("error", "계정이 정지 상태입니다.");
      return "buyer/buyer_login";
    }

    if ("탈퇴".equals(buyer.getStatus())) {
      model.addAttribute("error", "없는 계정입니다.");

      return "buyer/buyer_login";
    }

    HttpSession session = request.getSession(true);
    LoginForm loginForm2 = new LoginForm(
        buyer.getBuyerId(),
        buyer.getEmail(),
        buyer.getName(),
        buyer.getNickname()
    );

    session.setAttribute("loginBuyer", loginForm2);
    System.out.println("세션에 저장된 닉네임: " + loginForm2.getNickname());

    return "redirect:/home";
  }


  //로그인후 화면



  // 로그아웃
  @PostMapping("/logout") // POST http://localhost:9080/logout
  public String buyerLogout(HttpServletRequest request) {

    // 1) 세션정보 가져오기
    HttpSession session = request.getSession(false);

    // 2) 세션 제거
    if (session != null) {
      session.invalidate();
    }

    // 3) 로그아웃 후 로그인 페이지로 리다이렉트
    return "redirect:/home"; //
  }

  // 구매자 로그아웃 (home 페이지용)
  @PostMapping("/buyer/logout") // POST http://localhost:9080/buyer/logout
  public String buyerLogoutForHome(HttpServletRequest request) {

    // 1) 세션정보 가져오기
    HttpSession session = request.getSession(false);

    // 2) 세션 제거
    if (session != null) {
      session.invalidate();
    }

    // 3) 로그아웃 후 로그인 페이지로 리다이렉트
    return "redirect:/home"; //
  }

  // 회원 정보 조회 페이지
  @GetMapping("/info")
  public String buyerInfo(Model model, HttpSession session) {
    // 1) 로그인한 사용자의 ID 세션에서 가져오기 (예: 세션에 loginBuyer 객체가 있다고 가정)
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      return "redirect:/buyer/buyer_login"; // 로그인 안됐으면 로그인 페이지로
    }

    Long buyerId = loginBuyer.getBuyerId();

    // 2) DB에서 buyer 정보 조회
    Optional<Buyer> optionalBuyer = buyerSVC.findByBuyerId(buyerId);
    if (optionalBuyer.isEmpty()) {
      // 예외처리 혹은 에러 페이지 리턴 가능
      return "redirect:/buyer/buyer_login";
    }
    Buyer buyer = optionalBuyer.get();

    // 3) 생년월일 포맷팅 (예: yyyy-MM-dd 형태로 문자열 변환)
    String birthFormatted = "";
    if (buyer.getBirth() != null) {
      Date birth = buyer.getBirth(); // java.util.Date
      Instant instant = birth.toInstant();
      ZoneId zone = ZoneId.systemDefault();
      LocalDate localDate = instant.atZone(zone).toLocalDate();

      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
      birthFormatted = localDate.format(formatter);
    }

    // 4) 주소 파싱 (예시로 간단하게 공백 기준 분리)
    String parsedAddress = null;
    String parsedDetailAddress = null;
    if (buyer.getAddress() != null && !buyer.getAddress().isEmpty()) {
      // 예: "서울시 강남구 역삼동 123-45"
      String[] parts = buyer.getAddress().split(" ", 2);
      parsedAddress = parts[0];
      if (parts.length > 1) {
        parsedDetailAddress = parts[1];
      }
    }

    // 5) 모델에 데이터 담기
    model.addAttribute("buyer", buyer);
    model.addAttribute("birthFormatted", birthFormatted);
    model.addAttribute("parsedAddress", parsedAddress);
    model.addAttribute("parsedDetailAddress", parsedDetailAddress);

    return "buyer/buyer_info";
  }

  // 회원 정보 수정 페이지
  @GetMapping("/edit")
  public String updatePage(Model model,HttpSession session) {
    LoginForm loginForm = (LoginForm) session.getAttribute("loginBuyer");
    if ( loginForm == null) {
      session.invalidate();
      return "redirect:/login"; // 로그인 페이지로 리다이렉트
    }
    Optional<Buyer> optionalBuyer = buyerSVC.findByBuyerId(loginForm.getBuyerId());
    if(optionalBuyer.isPresent()){
      Buyer buyer = optionalBuyer.get();
      model.addAttribute("buyerEditForm",buyer);
      return "buyer/buyer_edit";
    }else {
      model.addAttribute("error","에러");
      session.invalidate();
      return "/home";
    }

  }

  // 회원 정보 수정 요청 처리
  @PostMapping("/edit")
  public String buyerEdit(@Valid @ModelAttribute("buyerEditForm") UpdateForm form,
                          BindingResult bindingResult,
                          HttpSession session,
                          Model model) {
    log.info("수정 요청 들어옴: {}", form);

    // 1) 로그인 검사
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      session.invalidate();
      return "redirect:/buyer/login";
    }

    // 2) DB에서 기존 구매자 정보 조회
    Optional<Buyer> optionalBuyer = buyerSVC.findByBuyerId(loginBuyer.getBuyerId());
    if (optionalBuyer.isEmpty()) {
      return "redirect:/buyer/login";
    }
    Buyer buyer = optionalBuyer.get();

    // 3) 비밀번호 확인 (비밀번호와 비밀번호 확인 값 일치 체크)
    if (form.getPassword() != null && form.getPasswordConfirm() != null) {
      if (!Objects.equals(form.getPassword(), form.getPasswordConfirm())) {
        bindingResult.rejectValue("passwdCheck", "password.mismatch", "비밀번호가 일치하지 않습니다.");
      }
    }

    // 4) 유효성 검사 에러 시 다시 폼 보여주기
    if (bindingResult.hasErrors()) {
      return "buyer/buyer_edit";
    }

    // 5) 비밀번호가 비어 있으면 기존 비밀번호 유지
    if (form.getPassword() == null || form.getPassword().trim().isEmpty()) {
      form.setPassword(buyer.getPassword());
    }

    // 6) Buyer 객체에 수정된 값 세팅
    buyer.setPassword(form.getPassword()); // 실제로는 암호화 필요
    buyer.setNickname(form.getNickname());
    buyer.setTel(form.getTel());
    buyer.setGender(form.getGender());

    if (form.getBirth() != null) {
      buyer.setBirth(java.sql.Date.valueOf(form.getBirth()));
    } else {
      buyer.setBirth(null);
    }

    if (form.getPostNumber() != null && !form.getPostNumber().isEmpty()) {
      try {
        buyer.setPostNumber(Long.parseLong(form.getPostNumber()));
      } catch (NumberFormatException e) {
        buyer.setPostNumber(null);
      }
    } else {
      buyer.setPostNumber(null);
    }

    String fullAddress = "";
    if (form.getAddress() != null) fullAddress += form.getAddress();
    if (form.getDetailAddress() != null && !form.getDetailAddress().isEmpty()) {
      fullAddress += " " + form.getDetailAddress();
    }
    buyer.setAddress(fullAddress.trim());

    // 7) DB 업데이트 수행
    buyerSVC.update(loginBuyer.getBuyerId(), buyer);

    // 8) 완료 후 내 정보 페이지로 이동
    return "redirect:/buyer/info";
  }


  // 삭제 요청
  @PostMapping("/delete")
  public String deleteBuyer(HttpSession session,
                            RedirectAttributes redirectAttributes,
                            Model model) {

    // 1. 세션에서 로그인 정보 가져오기
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      session.invalidate();
      model.addAttribute("error", "로그인이 필요합니다.");
      return "error/forbidden";
    }

    Long buyerId = loginBuyer.getBuyerId();

    // 2. 탈퇴 처리
    int result = buyerSVC.delete(buyerId);  // 상태 '탈퇴'로 변경

    if (result != 1) {
      model.addAttribute("error", "회원 탈퇴에 실패했습니다.");
      return "redirect:/buyer/buyer_info";  // 실패 시 마이페이지로
    }

    // 3. 세션 종료 및 홈으로 리다이렉트
    session.invalidate();
    return "redirect:/home";  // 홈으로 이동
  }

  // 비밀번호 확인
  @PostMapping("/verify-password")
  @ResponseBody
  public Map<String, Boolean> verifyPassword(@RequestBody Map<String, String> payload, HttpSession session) {
    String inputPassword = payload.get("password");

    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      return Map.of("success", false);
    }

    Optional<Buyer> optionalBuyer = buyerSVC.findByBuyerId(loginBuyer.getBuyerId());
    if (optionalBuyer.isEmpty()) {
      return Map.of("success", false);
    }

    Buyer buyer = optionalBuyer.get();

    boolean match = buyer.getPassword().equals(inputPassword);
    System.out.println("입력값: " + inputPassword);
    System.out.println("DB값: " + buyer.getPassword());
    System.out.println("일치 여부: " + match);

    return Map.of("success", match);
  }

  // 결제 페이지
  @GetMapping("/payment")
  public String paymentPage(HttpSession session) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      return "redirect:/buyer/login";
    }
    return "buyer/payment";
  }

  // 결제 완료 페이지
  @GetMapping("/payment_complete")
  public String paymentCompletePage(HttpSession session) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      return "redirect:/buyer/login";
    }
    return "buyer/payment_complete";
  }

  // 주문 내역 페이지
  @GetMapping("/orders")
  public String orderHistoryPage(HttpSession session, Model model) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      return "redirect:/buyer/login";
    }
    return "buyer/order_history";
  }
}









