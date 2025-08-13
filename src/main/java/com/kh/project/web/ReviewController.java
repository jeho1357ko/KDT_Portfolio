package com.kh.project.web;

import com.kh.project.domain.buyer.svc.BuyerSVC;
import com.kh.project.domain.entity.Review;
import com.kh.project.domain.review.svc.ReviewSVC;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.review.ReviewView;
import com.kh.project.web.review.SaveForm;
import com.kh.project.web.review.UpdateForm;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

  private final ReviewSVC reviewSVC;
  private final BuyerSVC buyerSVC;

  // 리뷰 저장
  @PostMapping("/save")
  public ApiResponse<Long> save(@RequestBody SaveForm saveForm, HttpSession session) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      log.warn("리뷰 저장 거부: 로그인 필요");
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
    }

    Review review = new Review();
    BeanUtils.copyProperties(saveForm, review);
    review.setBuyerId(loginBuyer.getBuyerId()); // 세션 buyerId 강제 세팅
    review.setCdate(LocalDateTime.now());
    review.setUdate(null);

    Long reviewId = reviewSVC.save(review);
    if (reviewId != null) {
      return ApiResponse.of(ApiResponseCode.SUCCESS, reviewId);
    } else {
      log.warn("리뷰 저장 실패: {}", review);
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
    }
  }

  // 단건 조회
  @GetMapping("/one")
  public ApiResponse<Review> findById(@RequestParam Long reviewId) {
    Optional<Review> optionalReview = reviewSVC.findById(reviewId);
    return optionalReview
        .map(r -> ApiResponse.of(ApiResponseCode.SUCCESS, r))
        .orElseGet(() -> ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null));
  }

  @GetMapping("/All")
  public ApiResponse<List<ReviewView>> findAll(@RequestParam(required = false) Long productId){
    List<Review> list = reviewSVC.findAll(productId);

    // buyerId -> nickname 맵 (중복 조회 방지)
    Map<Long,String> nicknameCache = new HashMap<>();

    List<ReviewView> views = list.stream().map(r -> {
      ReviewView v = new ReviewView();
      BeanUtils.copyProperties(r, v);

      String nickname = null;
      if (r.getBuyerId() != null) {
        nickname = nicknameCache.computeIfAbsent(r.getBuyerId(), bid -> {
          return buyerSVC.findByBuyerId(bid)
              .map(b -> b.getNickname())
              .orElse("익명");
        });
      }
      v.setBuyerNickname(nickname != null ? nickname : "익명");
      return v;
    }).collect(Collectors.toList());

    return ApiResponse.of(ApiResponseCode.SUCCESS, views);
  }

  // 리뷰 수정 (본인만 가능)
  @PatchMapping("/update/{reviewId}")
  public ApiResponse<Integer> update(
      @PathVariable Long reviewId,
      @RequestBody UpdateForm form,
      HttpSession session
  ) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      log.warn("리뷰 수정 거부: 로그인 필요");
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
    }

    Optional<Review> originOpt = reviewSVC.findById(reviewId);
    if (originOpt.isEmpty()) {
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, 0);
    }
    Review origin = originOpt.get();
    if (!loginBuyer.getBuyerId().equals(origin.getBuyerId())) {
      log.warn("리뷰 수정 거부: 소유자 불일치. buyerId={}, owner={}",
          loginBuyer.getBuyerId(), origin.getBuyerId());
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
    }

    Review r = new Review();
    r.setReviewId(reviewId);
    r.setTitle(form.getTitle());
    r.setContent(form.getContent());
    r.setPic(form.getPic());
    r.setScore(form.getScore());
    r.setUdate(LocalDateTime.now());

    int updated = reviewSVC.update(r);
    return updated > 0
        ? ApiResponse.of(ApiResponseCode.SUCCESS, updated)
        : ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
  }

  // 리뷰 삭제 (본인만 가능)
  @DeleteMapping("/delete/{reviewId}")
  public ApiResponse<Integer> delete(@PathVariable Long reviewId, HttpSession session) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      log.warn("리뷰 삭제 거부: 로그인 필요");
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
    }

    Optional<Review> originOpt = reviewSVC.findById(reviewId);
    if (originOpt.isEmpty()) {
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, 0);
    }
    Review origin = originOpt.get();
    if (!loginBuyer.getBuyerId().equals(origin.getBuyerId())) {
      log.warn("리뷰 삭제 거부: 소유자 불일치. buyerId={}, owner={}",
          loginBuyer.getBuyerId(), origin.getBuyerId());
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
    }

    int deleted = reviewSVC.deleteById(reviewId);
    return deleted > 0
        ? ApiResponse.of(ApiResponseCode.SUCCESS, deleted)
        : ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, 0);
  }
}
