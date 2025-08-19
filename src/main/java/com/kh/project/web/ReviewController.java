package com.kh.project.web;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.project.domain.buyer.svc.BuyerSVC;
import com.kh.project.domain.entity.Review;
import com.kh.project.domain.review.svc.ReviewSVC;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.review.ReviewView;
import com.kh.project.web.review.UpdateForm;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

  private final ReviewSVC reviewSVC;
  private final BuyerSVC buyerSVC;

  // 리뷰 저장
  @PostMapping("/save")
  public ApiResponse<Long> save(@RequestParam("productId") Long productId,
                                @RequestParam("orderId") Long orderId,
                                @RequestParam("orderItemId") Long orderItemId,
                                @RequestParam("title") String title,
                                @RequestParam("score") Long score,
                                @RequestParam("content") String content,
                                @RequestParam(value = "image", required = false) MultipartFile image,
                                HttpSession session) {
    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
    if (loginBuyer == null) {
      log.warn("리뷰 저장 거부: 로그인 필요");
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
    }

    try {
      Review review = new Review();
      review.setProductId(productId);
      review.setOrderId(orderId);
      review.setOrderItemId(orderItemId);
      review.setTitle(title);
      review.setScore(score);
      review.setContent(content);
      review.setBuyerId(loginBuyer.getBuyerId());
      review.setCdate(LocalDateTime.now());
      review.setUdate(null);

      // 이미지 처리
      if (image != null && !image.isEmpty()) {
        byte[] imageBytes = image.getBytes();
        review.setPic(imageBytes);
      }

      Long reviewId = reviewSVC.save(review);
      if (reviewId != null) {
        return ApiResponse.of(ApiResponseCode.SUCCESS, reviewId);
      } else {
        log.warn("리뷰 저장 실패: {}", review);
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }
    } catch (Exception e) {
      log.error("리뷰 저장 중 오류: {}", e.getMessage(), e);
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, null);
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
  public ApiResponse<List<ReviewView>> findAll(@RequestParam(value = "productId", required = false) Long productId){
    log.info("=== 리뷰 조회 시작 ===");
    log.info("요청된 productId: {}", productId);
    
    List<Review> list = reviewSVC.findAll(productId);
    log.info("조회된 리뷰 개수: {}", list.size());

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
      @PathVariable(value = "reviewId") Long reviewId,
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
  public ApiResponse<Integer> delete(@PathVariable(value = "reviewId") Long reviewId, HttpSession session) {
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
