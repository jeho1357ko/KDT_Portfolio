package com.kh.project.domain.wishlist.dao;

import com.kh.project.domain.buyer.dao.WishlistDAO;
import com.kh.project.domain.entity.Wishlist;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
@Slf4j
public class WishlistDAOImpl implements WishlistDAO {

  private final NamedParameterJdbcTemplate template;

  @Override
  public Long addWishlist(Wishlist wishlist) {
    return 0L;
  }

  @Override
  public int deleteWishlist(Long buyerId, Long productId) {
    return 0;
  }

  @Override
  public List<Wishlist> findWishlistByBuyerId(Long buyerId) {
    return List.of();
  }

  @Override
  public Optional<Wishlist> findWishlistByBuyerAndProduct(Long buyerId, Long productId) {
    return Optional.empty();
  }

  @Override
  public int countWishlistByBuyerId(Long buyerId) {
    return 0;
  }

  @Override
  public int countWishlistByProductId(Long productId) {
    return 0;
  }

  @Override
  public int deleteWishlistByBuyerAndProducts(Long buyerId, List<Long> productIds) {
    return 0;
  }
}