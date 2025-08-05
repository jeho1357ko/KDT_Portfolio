package com.kh.project.domain.wishlist.svc;

import com.kh.project.domain.buyer.dao.WishlistDAO;
import com.kh.project.domain.buyer.svc.WishlistSVC;
import com.kh.project.domain.entity.Wishlist;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WishlistSVCImpl implements WishlistSVC {

  private final WishlistDAO wishlistDAO;

  @Override
  public Long addWishlist(Long buyerId, Long productId) {
    return 0L;
  }

  @Override
  public boolean deleteWishlist(Long buyerId, Long productId) {
    return false;
  }

  @Override
  public List<Wishlist> getWishlistByBuyerId(Long buyerId) {
    return List.of();
  }

  @Override
  public boolean isWishlisted(Long buyerId, Long productId) {
    return false;
  }

  @Override
  public int getWishlistCountByBuyerId(Long buyerId) {
    return 0;
  }

  @Override
  public int getWishlistCountByProductId(Long productId) {
    return 0;
  }

  @Override
  public int deleteWishlistByBuyerAndProducts(Long buyerId, List<Long> productIds) {
    return 0;
  }

  @Override
  public boolean moveWishlistToCart(Long buyerId, Long productId) {
    return false;
  }
}