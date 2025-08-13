package com.kh.project.domain.review.svc;

import com.kh.project.domain.entity.Review;
import com.kh.project.domain.review.dao.ReviewDAO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
    return reviewDAO.findAll(productId);
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
