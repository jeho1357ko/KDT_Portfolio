package com.kh.project.domain.buyer.dao;

import java.util.List;
import java.util.Optional;

import com.kh.project.domain.entity.Wishlist;

/**
* 찜 목록 DAO 인터페이스
* 구매자의 찜 목록 관리를 위한 데이터 접근 인터페이스
*/
public interface WishlistDAO {

   /**
    * 찜 목록 추가
    * @param wishlist 찜 정보
    * @return 추가된 찜 목록 ID
    */
   Long addWishlist(Wishlist wishlist);

   /**
    * 찜 목록 삭제
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 삭제된 행 수
    */
   int deleteWishlist(Long buyerId, Long productId);

   /**
    * 구매자의 찜 목록 조회
    * @param buyerId 구매자 ID
    * @return 찜 목록
    */
   List<Wishlist> findWishlistByBuyerId(Long buyerId);

   /**
    * 특정 상품의 찜 여부 확인
    * @param buyerId 구매자 ID
    * @param productId 상품 ID
    * @return 찜 정보 (없으면 empty)
    */
   Optional<Wishlist> findWishlistByBuyerAndProduct(Long buyerId, Long productId);

   /**
    * 구매자의 찜 목록 개수 조회
    * @param buyerId 구매자 ID
    * @return 찜 목록 개수
    */
   int countWishlistByBuyerId(Long buyerId);

   /**
    * 상품의 찜 수 조회
    * @param productId 상품 ID
    * @return 찜 수
    */
   int countWishlistByProductId(Long productId);

   /**
    * 구매자의 찜 목록에서 상품 삭제 (여러 개)
    * @param buyerId 구매자 ID
    * @param productIds 상품 ID 목록
    * @return 삭제된 행 수
    */
   int deleteWishlistByBuyerAndProducts(Long buyerId, List<Long> productIds);
}