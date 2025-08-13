package com.kh.project.domain.review.dao;

import com.kh.project.domain.entity.Review;

import java.util.List;
import java.util.Optional;

public interface ReviewDAO {
  // 등록 (생성) — 생성된 PK 반환
  Long save(Review review);

  // 개별 조회
  Optional<Review> findById(Long reviewId);

  // 전체 조회
  List<Review> findAll(Long productId);

  // 수정
  int update(Review review);

  // 삭제
  int deleteById(Long reviewId);
}

