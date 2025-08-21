package com.kh.project.web;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.project.domain.cart.svc.CartSVC;
import com.kh.project.domain.entity.Cart;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import com.kh.project.web.buyer.ApiCartDeleteForm;
import com.kh.project.web.buyer.ApiCartSaveForm;
import com.kh.project.web.buyer.ApiCartUpdateForm;
import com.kh.project.web.buyer.CartItemDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

  final private CartSVC cartSVC;
  final private ProductSVC productSVC;

  // 장바구니 담기
  @PostMapping
  public ApiResponse<String> saveOrder(@RequestBody ApiCartSaveForm saveForm) {
    Cart cart = new Cart();
    BeanUtils.copyProperties(saveForm, cart);
    Long cid = cartSVC.addOrderInCart(cart);
    
    if (cid == null) {
      // 중복 상품인 경우
      log.info("장바구니 추가 실패: buyerId={}, productId={}, quantity={}", 
               cart.getBuyerId(), cart.getProductId(), cart.getQuantity());
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, "이미 장바구니에 있는 상품입니다.");
    }
    
    return ApiResponse.of(ApiResponseCode.SUCCESS, "장바구니에 추가되었습니다.");
  }

  // 개별 삭제
  @PostMapping("/delete")
  public ApiResponse<String> delete(@RequestBody ApiCartDeleteForm deleteForm) {
    int i = cartSVC.delete(deleteForm.getCartId());
    if (i == 0) {
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, "실패");
    } else {
      return ApiResponse.of(ApiResponseCode.SUCCESS, "성공");
    }
  }

  // 주문 선택
  @PostMapping("/check")
  public ApiResponse<Void> check(@RequestBody ApiCartDeleteForm deleteForm) {
    log.info("Cart check 요청: cartId={}", deleteForm.getCartId());
    
    if (deleteForm.getCartId() == null) {
      log.error("Cart check 실패: cartId가 null입니다.");
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);
    }
    
    int i = cartSVC.checkItems(deleteForm.getCartId());
    log.info("Cart check 결과: {}", i);

    if (i == 0) {
      log.error("Cart check 실패: 업데이트된 행이 없습니다. cartId={}", deleteForm.getCartId());
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);
    } else {
      log.info("Cart check 성공: cartId={}가 'Y'로 업데이트됨", deleteForm.getCartId());
      return ApiResponse.of(ApiResponseCode.SUCCESS, null);
    }
  }

  // 주문 선택 취소
  @PostMapping("/uncheck")
  public ApiResponse<Void> uncheck(@RequestBody Long cid) {
    int i = cartSVC.uncheckItems(cid);

    if (i == 0) {
      return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);
    } else {
      return ApiResponse.of(ApiResponseCode.SUCCESS, null);
    }
  }

  // 장바구니 상품 수량 변경
  @PostMapping("/quantity")
  public ApiResponse<Cart> quantity(@RequestBody ApiCartUpdateForm updateForm) {
    Cart cart = new Cart();
    BeanUtils.copyProperties(updateForm, cart);
    int i = cartSVC.quantityChange(cart);
    return i == 1 ? ApiResponse.of(ApiResponseCode.SUCCESS, cart) : ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);
  }

  //장바구니 초기화
  @PostMapping("/reset")
  public ApiResponse<Void> reset(@RequestBody Long bid) {
    int i = cartSVC.clearCart(bid);
    return ApiResponse.of(i == 0 ? ApiResponseCode.ENTITY_NOT_FOUND : ApiResponseCode.SUCCESS, null);
  }

  // 주문 완료된 주문 삭제
  @PostMapping("/checkout")
  public  ApiResponse<Void> checkout(@RequestBody Long bid){
    int i = cartSVC.deleteCheckedItems(bid);
    return ApiResponse.of(i == 0 ? ApiResponseCode.ENTITY_NOT_FOUND : ApiResponseCode.SUCCESS, null);
  }

  // 장바구니 목록 조회
  @GetMapping("/{bid}")
  public ApiResponse<List<CartItemDTO>> findByBuyerId(@PathVariable(value = "bid") Long bid) {
    log.info("=== 장바구니 조회 API 호출 ===");
    log.info("요청된 buyerId: {}", bid);
    log.info("현재 서버 포트: {}", System.getProperty("server.port"));
    
    List<Cart> cartList = cartSVC.findByBuyerId(bid);
    log.info("CartSVC에서 조회된 cart 개수: {}", cartList.size());
    
    if (cartList.isEmpty()) {
      log.warn("장바구니가 비어있습니다. buyerId: {}", bid);
      return ApiResponse.of(ApiResponseCode.SUCCESS, List.of());
    }
    
    List<CartItemDTO> cartItems = cartList.stream().map(cart -> {
      
      
      Product product = productSVC.findById(cart.getProductId()).orElseThrow();
      CartItemDTO dto = new CartItemDTO();
      dto.setCartId(cart.getCartId());
      dto.setProductId(cart.getProductId());
      dto.setQuantity(cart.getQuantity());
      dto.setIsChecked(String.valueOf(cart.getIsChecked()));
      dto.setProductTitle(product.getTitle());
      dto.setProductThumbnail(product.getThumbnail());
      dto.setProductPrice(product.getPrice());
      dto.setDeliveryFee(product.getDeliveryFee());
      
      
      return dto;
    }).toList();
    
    log.info("최종 반환할 cartItems 개수: {}", cartItems.size());
    log.info("=== 장바구니 조회 API 완료 ===");
    
    // 빈 목록이어도 성공 응답 반환
    return ApiResponse.of(ApiResponseCode.SUCCESS, cartItems);
  }

  // 매진 상품 체크
  @PostMapping("/check-stock")
  public ApiResponse<List<Long>> checkStock(@RequestBody List<Long> productIds) {
    List<Long> soldOutProducts = productIds.stream()
        .filter(productId -> {
          Optional<Product> product = productSVC.findById(productId);
          return product.isEmpty() || product.get().getQuantity() <= 0;
        })
        .toList();
    return ApiResponse.of(ApiResponseCode.SUCCESS, soldOutProducts);
  }

  // 결제 완료된 상품 삭제
  @PostMapping("/delete-completed")
  public ApiResponse<String> deleteCompletedItems(@RequestBody Long buyerId) {
    log.info("결제 완료된 상품 삭제 요청: buyerId={}", buyerId);
    
    try {
      int deletedCount = cartSVC.deleteCompletedItems(buyerId);
      log.info("결제 완료된 상품 삭제 완료: buyerId={}, 삭제된 상품 수={}", buyerId, deletedCount);
      return ApiResponse.of(ApiResponseCode.SUCCESS, "삭제 완료: " + deletedCount + "개 상품");
    } catch (Exception e) {
      log.error("결제 완료된 상품 삭제 실패: buyerId={}", buyerId, e);
      return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, "삭제 실패");
    }
  }

}







