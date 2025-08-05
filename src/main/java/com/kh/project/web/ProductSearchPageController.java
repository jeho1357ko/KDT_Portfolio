package com.kh.project.web;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.kh.project.domain.elasticsearch.ProductSearchSVC;
import com.kh.project.domain.entity.Product;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.seller.LoginSeller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Controller
@RequestMapping("/product")
public class ProductSearchPageController {
    
    final private ProductSearchSVC productSearchSVC;
    
    @GetMapping("/search")
    public String searchPage(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "price", required = false) String price,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            Model model,
            HttpServletRequest request) {
        
        log.info("상품 검색 페이지 요청: keyword={}, status={}, price={}, sort={}, page={}", 
                keyword, status, price, sort, page);
        
        try {
            // 검색 파라미터 처리
            String searchKeyword = keyword != null ? keyword.trim() : "";
            String searchStatus = status != null && !status.isEmpty() ? status : null;
            Integer minPrice = null;
            Integer maxPrice = null;
            
            // 가격 필터 처리
            if (price != null && !price.isEmpty()) {
                String[] priceRange = price.split("-");
                if (priceRange.length == 2) {
                    try {
                        minPrice = Integer.parseInt(priceRange[0]);
                        maxPrice = Integer.parseInt(priceRange[1]);
                    } catch (NumberFormatException e) {
                        log.warn("가격 필터 파싱 오류: {}", price);
                    }
                } else if (priceRange.length == 1 && priceRange[0].endsWith("-")) {
                    try {
                        minPrice = Integer.parseInt(priceRange[0].replace("-", ""));
                    } catch (NumberFormatException e) {
                        log.warn("가격 필터 파싱 오류: {}", price);
                    }
                }
            }
            
            // 정렬 파라미터 처리
            String sortScore = null;
            String sortDate = null;
            if (sort != null && !sort.isEmpty()) {
                switch (sort) {
                    case "date-desc":
                        sortDate = "DESC";
                        break;
                    case "date-asc":
                        sortDate = "ASC";
                        break;
                    case "price-desc":
                        sortScore = "DESC";
                        break;
                    case "price-asc":
                        sortScore = "ASC";
                        break;
                }
            }
            
            // 페이지네이션 설정
            int pageSize = 12; // 한 페이지당 상품 수
            int from = (page - 1) * pageSize;
            
            // 검색 실행
            List<Product> products = productSearchSVC.search(
                searchKeyword, searchStatus, minPrice, maxPrice, 
                sortScore, sortDate, from, pageSize
            );
            
            // 모델에 데이터 추가
            model.addAttribute("products", products);
            model.addAttribute("keyword", searchKeyword);
            model.addAttribute("status", status);
            model.addAttribute("price", price);
            model.addAttribute("sort", sort);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", Math.max(1, (products.size() + pageSize - 1) / pageSize));
            
            log.info("검색 결과: {}개 상품", products.size());
            
            // 세션에서 로그인 정보 처리
            HttpSession session = request.getSession(false);
            if (session != null) {
                // 구매자 로그인 상태 확인
                LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
                if (loginBuyer != null) {
                    model.addAttribute("nickname", loginBuyer.getNickname());
                    model.addAttribute("buyerId", loginBuyer.getBuyerId());
                }
                
                // 판매자 로그인 상태 확인
                LoginSeller loginSeller = (LoginSeller) session.getAttribute("loginSeller");
                if (loginSeller != null) {
                    model.addAttribute("nickname", loginSeller.getName());
                    model.addAttribute("sellerId", loginSeller.getSellerId());
                }
            }
            
            return "product/search";
            
        } catch (Exception e) {
            log.error("상품 검색 중 오류 발생: {}", e.getMessage(), e);
            model.addAttribute("products", List.of());
            model.addAttribute("error", "검색 중 오류가 발생했습니다.");
            return "product/search";
        }
    }
} 