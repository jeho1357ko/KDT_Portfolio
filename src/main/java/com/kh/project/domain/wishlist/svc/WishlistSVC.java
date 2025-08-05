package com.kh.project.domain.buyer.svc;

import java.util.List;

import com.kh.project.domain.entity.Wishlist;

/**
* 찜 목록 서비스 인터페이스
* 구매자의 찜 목록 관리를 위한 비즈니스 로직 인터페이스
*/
public interface WishlistSVC {

   /**
    * 찜 목록 추가
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 추가된 찜 목록 ID
    */
   Long addWishlist(Long buyerId, Long productId);

   /**
    * 찜 목록 삭제
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 삭제 성공 여부
    */
   boolean deleteWishlist(Long buyerId, Long productId);

   /**
    * 구매자의 찜 목록 조회 (상품 정보 포함)
    * @param buyerId 구매자 ID
    * @return 찜 목록 (상품 정보 포함)
    */
   List<Wishlist> getWishlistByBuyerId(Long buyerId);

   /**
    * 특정 상품의 찜 여부 확인
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 찜 여부
    */
   boolean isWishlisted(Long buyerId, Long productId);

   /**
    * 구매자의 찜 목록 개수 조회
    * @param buyerId 구매자 ID
    * @return 찜 목록 개수
    */
   int getWishlistCountByBuyerId(Long buyerId);

   /**
    * 상품의 찜 수 조회
    * @param productId 상품 ID
    * @return 찜 수
    */
   int getWishlistCountByProductId(Long productId);

   /**
    * 구매자의 찜 목록에서 상품 삭제 (여러 개)
    * @param buyerId 구매자 ID
    * @param productIds 상품 ID 목록
    * @return 삭제된 개수
    */
   int deleteWishlistByBuyerAndProducts(Long buyerId, List<Long> productIds);

   /**
    * 찜 목록에서 장바구니로 이동
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 이동 성공 여부
    */
   boolean moveWishlistToCart(Long buyerId, Long productId);
}