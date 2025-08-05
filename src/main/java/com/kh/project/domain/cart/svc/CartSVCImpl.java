package com.kh.project.domain.cart.svc;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kh.project.domain.cart.dao.CartDAO;
import com.kh.project.domain.entity.Cart;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class CartSVCImpl implements CartSVC{

  private final CartDAO cartDAO;
  private final ProductSVC productSVC;

  // 장바구니 추가 (중복 체크 + 재고 체크 포함)
  @Override
  public Long addOrderInCart(Cart cart) {
    log.info("장바구니 추가 시도: buyerId={}, productId={}, quantity={}", 
             cart.getBuyerId(), cart.getProductId(), cart.getQuantity());
    
    // 1. 중복 체크 (먼저 실행)
    boolean exists = isExistInCart(cart.getBuyerId(), cart.getProductId());
    log.info("중복 체크 결과: buyerId={}, productId={}, exists={}", 
             cart.getBuyerId(), cart.getProductId(), exists);
    
    if (exists) {
      log.info("장바구니 중복 상품 발견: buyerId={}, productId={}", cart.getBuyerId(), cart.getProductId());
      return null; // 중복인 경우 null 반환
    }
    
    // 2. 상품 존재 여부 및 재고 체크 (중복이 아닐 때만)
    Optional<Product> productOpt = productSVC.findById(cart.getProductId());
    if (productOpt.isEmpty()) {
      log.error("상품을 찾을 수 없음: productId={}", cart.getProductId());
      return null;
    }
    
    Product product = productOpt.get();
    if (product.getQuantity() < cart.getQuantity()) {
      log.error("재고 부족: productId={}, 요청수량={}, 재고={}", 
                cart.getProductId(), cart.getQuantity(), product.getQuantity());
      return null;
    }
    
    if (product.getQuantity() <= 0) {
      log.error("매진 상품: productId={}, 재고={}", cart.getProductId(), product.getQuantity());
      return null;
    }
    
    Long result = cartDAO.addOrderInCart(cart);
    log.info("장바구니 추가 결과: cartId={}", result);
    return result;
  }

  // 장바구니 조회
  @Override
  public List<Cart> findByBuyerId(Long bid) {
    return cartDAO.findByBuyerId(bid);
  }

  // 장바구니 삭제
  @Override
  public int delete(Long cid) {
    return cartDAO.delete(cid);
  }

  // 장바구니 체크
  @Override
  public int checkItems(Long cid) {
    return cartDAO.checkItems(cid);
  }

  // 장바구니 수량 변경
  @Override
  public int quantityChange(Cart cart) {
    return cartDAO.quantityChange(cart);
  }

  // 장바구니 초기화
  @Override
  public int clearCart(Long buyerId) {
    return cartDAO.clearCart(buyerId);
  }

  // 장바구니 주문 선택 해제
  @Override
  public int deleteCheckedItems(Long buyerId) {
    return cartDAO.deleteCheckedItems(buyerId);
  }

  // 결제 완료된 상품 삭제 (is_checked = 'Y'인 상품들)
  @Override
  public int deleteCompletedItems(Long buyerId) {
    log.info("결제 완료된 상품 삭제 시작: buyerId={}", buyerId);
    int deletedCount = cartDAO.deleteCompletedItems(buyerId);
    log.info("결제 완료된 상품 삭제 완료: buyerId={}, 삭제된 상품 수={}", buyerId, deletedCount);
    return deletedCount;
  }

  // 장바구니 주문 선택 해제
  @Override
  public int uncheckItems(Long cid) {
    return cartDAO.uncheckItems(cid);
  }

  // 중복 체크 - 구매자와 상품으로 기존 장바구니 항목 조회
  @Override
  public boolean isExistInCart(Long buyerId, Long productId) {
    log.info("중복 체크 실행: buyerId={}, productId={}", buyerId, productId);
    boolean exists = cartDAO.findByBuyerIdAndProductId(buyerId, productId).isPresent();
    log.info("중복 체크 결과: buyerId={}, productId={}, exists={}", buyerId, productId, exists);
    return exists;
  }
}
