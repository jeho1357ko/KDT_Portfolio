-- =====================================================
-- 찜 테이블 생성 스크립트
-- =====================================================
-- 구매자가 상품을 찜 목록에 추가/제거하는 기능을 위한 테이블입니다.

-- 1. 찜 시퀀스 생성
CREATE SEQUENCE wishlist_wishlist_id_seq START WITH 1 INCREMENT BY 1 MAXVALUE 99999;

-- 2. 찜 테이블 생성
CREATE TABLE WISHLIST (
    wishlist_id NUMBER(5) DEFAULT wishlist_wishlist_id_seq.NEXTVAL PRIMARY KEY,  -- 찜 고유 ID (자동 증가)
    buyer_id NUMBER(5) NOT NULL,                                                  -- 구매자 ID (외래키)
    product_id NUMBER(5) NOT NULL,                                                -- 상품 ID (외래키)
    added_at TIMESTAMP DEFAULT SYSTIMESTAMP,                                      -- 찜 추가 시간
    CONSTRAINT fk_wishlist_buyer FOREIGN KEY (buyer_id) REFERENCES buyer(buyer_id),     -- 구매자 외래키
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES product(product_id), -- 상품 외래키
    CONSTRAINT uq_wishlist UNIQUE (buyer_id, product_id)                          -- 동일 구매자의 동일 상품 중복 찜 방지
);

-- =====================================================
-- 찜 테이블 인덱스 생성
-- =====================================================
-- 성능 향상을 위한 인덱스들을 생성합니다.

-- 구매자별 찜 목록 조회를 위한 인덱스
CREATE INDEX idx_wishlist_buyer_id ON WISHLIST(buyer_id);

-- 상품별 찜 수 조회를 위한 인덱스
CREATE INDEX idx_wishlist_product_id ON WISHLIST(product_id);

-- 찜 추가 시간 순으로 정렬하기 위한 인덱스
CREATE INDEX idx_wishlist_added_at ON WISHLIST(added_at);

-- =====================================================
-- 찜 테이블 테스트 데이터 삽입
-- =====================================================

-- 구매자1의 찜 목록
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (1, 1);  -- 스마트폰 케이스
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (1, 2);  -- 무선 이어폰
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (1, 5);  -- 게이밍 마우스

-- 구매자2의 찜 목록
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (2, 3);  -- 노트북 스탠드
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (2, 4);  -- 기계식 키보드
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (2, 6);  -- 모니터 암

-- 구매자3의 찜 목록
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (3, 7);  -- USB 허브
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (3, 8);  -- 웹캠
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (3, 9);  -- 외장하드

-- 구매자4의 찜 목록
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (4, 10); -- 태블릿 거치대
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (4, 1);  -- 스마트폰 케이스

-- 구매자5의 찜 목록
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (5, 2);  -- 무선 이어폰
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (5, 4);  -- 기계식 키보드
INSERT INTO WISHLIST (buyer_id, product_id) VALUES (5, 8);  -- 웹캠

COMMIT;

-- =====================================================
-- 찜 관련 유용한 쿼리 예시
-- =====================================================

-- 1. 특정 구매자의 찜 목록 조회 (상품 정보 포함)
/*
SELECT 
    w.wishlist_id,
    w.added_at,
    p.product_id,
    p.product_name,
    p.title,
    p.price,
    p.thumbnail,
    p.status,
    s.shop_name as seller_name
FROM WISHLIST w
JOIN PRODUCT p ON w.product_id = p.product_id
JOIN SELLER s ON p.seller_id = s.seller_id
WHERE w.buyer_id = 1
ORDER BY w.added_at DESC;
*/

-- 2. 특정 상품의 찜 수 조회
/*
SELECT 
    p.product_id,
    p.product_name,
    COUNT(w.wishlist_id) as wish_count
FROM PRODUCT p
LEFT JOIN WISHLIST w ON p.product_id = w.product_id
WHERE p.product_id = 1
GROUP BY p.product_id, p.product_name;
*/

-- 3. 가장 많이 찜된 상품 TOP 5
/*
SELECT 
    p.product_id,
    p.product_name,
    p.title,
    p.price,
    COUNT(w.wishlist_id) as wish_count
FROM PRODUCT p
LEFT JOIN WISHLIST w ON p.product_id = w.product_id
GROUP BY p.product_id, p.product_name, p.title, p.price
ORDER BY wish_count DESC
FETCH FIRST 5 ROWS ONLY;
*/

-- 4. 찜 목록에서 장바구니로 이동하는 쿼리 예시
/*
-- 찜 목록의 상품을 장바구니에 추가 (수량 1로)
INSERT INTO CART (buyer_id, product_id, quantity)
SELECT buyer_id, product_id, 1
FROM WISHLIST
WHERE buyer_id = 1 AND product_id = 1;

-- 장바구니에 추가 후 찜 목록에서 삭제
DELETE FROM WISHLIST 
WHERE buyer_id = 1 AND product_id = 1;
*/

-- =====================================================
-- 찜 테이블 삭제 스크립트 (필요시 사용)
-- =====================================================
/*
-- 찜 테이블 삭제
DROP TABLE WISHLIST CASCADE CONSTRAINTS;

-- 찜 시퀀스 삭제
DROP SEQUENCE wishlist_wishlist_id_seq;

COMMIT;
*/ 