package com.kh.project.domain.review.svc;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kh.project.domain.entity.Review;
import com.kh.project.domain.review.dao.ReviewDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewSVCImpl  implements ReviewSVC{

  final private ReviewDAO reviewDAO;

  @Override
  public Long save(Review review) {
    return reviewDAO.save(review);
  }

  @Override
  public Optional<Review> findById(Long reviewId) {
    return reviewDAO.findById(reviewId);
  }

  @Override
  public List<Review> findAll(Long productId) {
    log.info("ReviewSVC.findAll 호출 - productId: {}", productId);
    List<Review> result = reviewDAO.findAll(productId);
    log.info("ReviewSVC.findAll 결과 - 리뷰 개수: {}", result.size());
    return result;
  }

  @Override
  public int update(Review review) {
    return reviewDAO.update(review);
  }

  @Override
  public int deleteById(Long reviewId) {
    return reviewDAO.deleteById(reviewId);
  }
}
