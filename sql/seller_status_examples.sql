-- 판매자 계정 상태별 예시 데이터 SQL
-- 상태: '활성화', '비활성화', '정지', '탈퇴'

-- 기존 데이터 삭제 (필요시)
-- DELETE FROM seller WHERE email LIKE '%example%';

-- 1. 활성화 상태 판매자 (정상 사용 가능)
INSERT INTO seller (email, password, bizRegNo, shopName, name, shopAddress, postNumber, tel, birth, cdate, udate, status) 
    VALUES ('active.seller@example.com','password123','123-45-67890','활성화 상점','김활성','서울특별시 강남구 테헤란로 123',06123,'010-1234-5678','1990-01-15',NOW(),NOW(),'활성화');

-- 2. 비활성화 상태 판매자 (로그인 불가)
INSERT INTO seller (email, password, bizRegNo, shopName, name, shopAddress, postNumber, tel, birth, cdate, udate, status) 
    VALUES ('inactive.seller@example.com','password123','234-56-78901','비활성화 상점','이비활성','서울특별시 서초구 서초대로 456',06611,'010-2345-6789','1985-03-20',NOW(),NOW(),'비활성화');

-- 3. 정지 상태 판매자 (로그인 불가)
INSERT INTO seller (email, password, bizRegNo, shopName, name, shopAddress, postNumber, tel, birth, cdate, udate, status) 
    VALUES ('suspended.seller@example.com','password123','345-67-89012','정지 상점','박정지','서울특별시 마포구 와우산로 789',04040,'010-3456-7890','1988-07-10',NOW(),NOW(),'정지');

-- 4. 탈퇴 상태 판매자 (재가입 가능)
INSERT INTO seller (email, password, bizRegNo, shopName, name, shopAddress, postNumber, tel, birth, cdate, udate, status) 
    VALUES ('withdrawn.seller@example.com','password123','456-78-90123','탈퇴 상점','최탈퇴','서울특별시 종로구 종로 101',03123,'010-4567-8901','1992-12-25',NOW(),NOW(),'탈퇴');

-- 5. 추가 활성화 상태 판매자 (테스트용)
INSERT INTO seller (email, password, bizRegNo, shopName, name, shopAddress, postNumber, tel, birth, cdate, udate, status) 
    VALUES ('test.seller@example.com','password123','567-89-01234','테스트 상점','정테스트','서울특별시 영등포구 여의대로 202',07345,'010-5678-9012','1995-05-05',NOW(),NOW(),'활성화');

-- 상태별 조회 쿼리 예시
-- 활성화 상태 판매자만 조회
SELECT * FROM seller WHERE status = '활성화';

-- 비활성화 상태 판매자만 조회
SELECT * FROM seller WHERE status = '비활성화';

-- 정지 상태 판매자만 조회
SELECT * FROM seller WHERE status = '정지';

-- 탈퇴 상태 판매자만 조회
SELECT * FROM seller WHERE status = '탈퇴';

-- 로그인 가능한 판매자만 조회 (활성화 상태만)
SELECT * FROM seller WHERE status = '활성화';

-- 로그인 불가능한 판매자 조회 (비활성화, 정지, 탈퇴)
SELECT * FROM seller WHERE status IN ('비활성화', '정지', '탈퇴');

-- 전체 상태별 통계
SELECT 
    status,
    COUNT(*) as count
FROM seller 
GROUP BY status 
ORDER BY 
    CASE status 
        WHEN '활성화' THEN 1
        WHEN '비활성화' THEN 2
        WHEN '정지' THEN 3
        WHEN '탈퇴' THEN 4
    END; 