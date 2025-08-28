package com.kh.project.web;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.project.domain.entity.Order;
import com.kh.project.domain.entity.OrderItem;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.order.svc.OrderSVC;
import com.kh.project.domain.orderItem.svc.OrderItemSVC;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.web.api.ApiResponse;
import com.kh.project.web.api.ApiResponseCode;
import com.kh.project.web.buyer.LoginForm;
import com.kh.project.web.order.ListForm;
import com.kh.project.web.order.OrderForm;
import com.kh.project.web.order.OrderResponseDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/order")
public class OrderController {

  final private OrderSVC orderSVC;
  final private OrderItemSVC orderItemSVC;
  final private ProductSVC productSVC;

  //단일 상품 주문 (ex. 상품 상세페이지에서 바로 구매)
  @PostMapping("/single")
  public ApiResponse<OrderResponseDTO> saveOrder(@RequestBody OrderForm orderForm) {
    try {
      // 1) 유효성 + 재고 확인
      if (orderForm.getItems() == null || orderForm.getItems().isEmpty()) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null);
      }
      OrderItem item = orderForm.getItems().get(0);
      Optional<Product> productOpt = productSVC.findById(item.getProductId());
      if (productOpt.isEmpty()) {
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }
      Product product = productOpt.get();
      if (!"판매중".equals(product.getStatus()) || product.getQuantity() < item.getQuantity()) {
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }

      // 2) 주문 저장
      Order order = new Order();
      BeanUtils.copyProperties(orderForm, order);
      order.setOrderStatus("결제완료");
      order.setOrderDate(LocalDateTime.now());
      Long orderId = orderSVC.saveOrder(order);
      if (orderId == null) {
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }

      // 3) 주문상품 저장
      item.setOrderId(orderId);
      int result = orderItemSVC.saveItem(item);
      if (result == 0) {
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }

      // 4) 재고 차감
      boolean decreased = productSVC.decreaseQuantity(item.getProductId(), item.getQuantity());
      if (!decreased) {
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }

      // 5) 응답 DTO
      OrderResponseDTO dto = new OrderResponseDTO();
      dto.setOrderId(orderId);
      dto.setOrderNumber(order.getOrderNumber());
      dto.setOrderDate(order.getOrderDate());
      dto.setOrderStatus(order.getOrderStatus());
      dto.setTotalPrice(item.getTotalPrice());
      return ApiResponse.of(ApiResponseCode.SUCCESS, dto);

    } catch (Exception e) {
      e.printStackTrace(); // 실무에서는 log.error(...)로 로깅
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, null);
    }
  }

  // 장바구니 기반 주문 (여러 개 한 번에 주문)
  @PostMapping("/cart")
  public ApiResponse<OrderForm> saveOrders(@RequestBody OrderForm orderForm, HttpSession session) {
    try {
      log.info("주문 요청 받음: {}", orderForm);
      
      // 1) 로그인 유효성
      LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
      if (loginBuyer == null) {
        log.error("로그인 정보 없음");
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null);
      }

      // 2) 주문 유효성
      if (orderForm.getItems() == null || orderForm.getItems().isEmpty()) {
        log.error("주문 상품 없음");
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null);
      }

      // 3) 재고 사전 검증
      for (OrderItem it : orderForm.getItems()) {
        Optional<Product> p = productSVC.findById(it.getProductId());
        if (p.isEmpty()) {
          log.error("상품 없음: {}", it.getProductId());
          return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
        }
        Product pr = p.get();
        if (!"판매중".equals(pr.getStatus()) || pr.getQuantity() < it.getQuantity()) {
          log.error("재고 부족 또는 판매중 아님: pid={}, 재고={}, 요청={}", it.getProductId(), pr.getQuantity(), it.getQuantity());
          return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
        }
      }

      // 4) buyerId 설정
      orderForm.setBuyerId(loginBuyer.getBuyerId());

      // 5) 주문 저장
      Order order = new Order();
      BeanUtils.copyProperties(orderForm, order);
      order.setOrderStatus("결제완료");
      order.setOrderDate(LocalDateTime.now());
      Long orderId = orderSVC.saveOrder(order);
      if (orderId == null) {
        log.error("주문 저장 실패");
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
      }

      // 6) 주문상품 저장 + 재고 차감
      for (OrderItem item : orderForm.getItems()) {
        item.setOrderId(orderId);
        int result = orderItemSVC.saveItem(item);
        if (result == 0) {
          log.error("주문상품 저장 실패: {}", item);
          return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
        }
        boolean decreased = productSVC.decreaseQuantity(item.getProductId(), item.getQuantity());
        if (!decreased) {
          log.error("재고 차감 실패: pid={}, qty={}", item.getProductId(), item.getQuantity());
          return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, null);
        }
      }

      // 7) 응답 DTO
      OrderForm dto = new OrderForm();
      dto.setOrderId(orderId);
      dto.setOrderNumber(order.getOrderNumber());
      dto.setOrderDate(order.getOrderDate());
      dto.setOrderStatus(order.getOrderStatus());
      dto.setTotalPrice(orderForm.getTotalPrice());

      log.info("주문 완료: {}", dto);
      return ApiResponse.of(ApiResponseCode.SUCCESS, dto);

    } catch (Exception e) {
      log.error("주문 처리 중 예외 발생", e);
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, null);
    }
  }

  // 개별 주문 조회 (주문번호 또는 주문 ID로 상세 조회)
  @GetMapping("/detail")
  public ApiResponse<OrderForm> detail(@RequestParam("orderId") Long orderId) {
    try {
      // 1. 유효성 검사 - orderId가 null
      if (orderId == null) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null);
      }

      // 2. 주문 조회
      Optional<Order> optionalOrder = orderSVC.findById(orderId);
      if (optionalOrder.isEmpty()) {
        return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);  // 주문이 없음
      }
      Order order = optionalOrder.get();

      // 3. 주문상품 조회
      List<OrderItem> items = orderItemSVC.findItemsByOrderId(orderId);
      if (items == null || items.isEmpty()) {
        return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null);  // 주문상품이 없음
      }

      // 4. 각 주문상품에 상품 정보 추가
      for (OrderItem item : items) {
        Optional<Product> product = productSVC.findById(item.getProductId());
        if (product.isPresent()) {
                  // OrderItem에 상품 정보 추가
        item.setDeliveryCompany(product.get().getTitle());
        item.setTrackingNumber(product.get().getThumbnail());
        }
      }

      // 5. 응답 DTO 구성
      OrderForm orderForm = new OrderForm();
      BeanUtils.copyProperties(order, orderForm);
      orderForm.setItems(items);

      return ApiResponse.of(ApiResponseCode.SUCCESS, orderForm);

    } catch (Exception e) {
      e.printStackTrace();  // 실무에서는 log.error(...) 사용
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, null);
    }
  }

  //주문 전체 조회 (해당 구매자의 전체 주문 내역 목록)
  @GetMapping("/list")
  public ApiResponse<ListForm> list(HttpSession session) {
    try {
      // 1. 로그인 유효성 검사
      LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");
      if (loginBuyer == null) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null); // 로그인 정보 없음
      }

      Long buyerId = loginBuyer.getBuyerId();
      if (buyerId == null) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, null); // 구매자 ID 없음
      }

      // 2. 주문 목록 조회
      List<Order> list = orderSVC.findByIds(buyerId);
      if (list == null || list.isEmpty()) {
        return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, null); // 주문 내역 없음
      }

      // 3. 각 주문에 대한 주문 상품 정보 추가
      for (Order order : list) {
        List<OrderItem> orderItems = orderItemSVC.findItemsByOrderId(order.getOrderId());
        if (orderItems != null && !orderItems.isEmpty()) {
          // 주문에 상품 개수 정보 추가
          order.setName(order.getName() + " | " + orderItems.size() + "개 상품");
        }
      }

      // 4. 응답 DTO 구성
      ListForm listForm = new ListForm();
      listForm.setList(list);

      return ApiResponse.of(ApiResponseCode.SUCCESS, listForm);

    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, null);
    }
  }

  //수량 변경 (주문 상품 단위로 수량 변경, 총액도 자동 갱신)
  @PatchMapping("/item/quantity")
  public ApiResponse<String> updateItemQuantity(@RequestBody OrderItem orderItem) {
    try {
      // 1. 유효성 검사
      if (orderItem.getOrderItemId() == null || orderItem.getQuantity() == null || orderItem.getQuantity() <= 0) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, "수량은 1 이상이어야 합니다.");
      }

      // 2. 수량 + 총액 업데이트
      int result = orderItemSVC.updateItem(orderItem);

      if (result < 2) { // 둘 다 업데이트돼야 성공 (수량 + 총액)
        return ApiResponse.of(ApiResponseCode.BUSINESS_ERROR, "수량 변경 실패");
      }

      return ApiResponse.of(ApiResponseCode.SUCCESS, "수량이 성공적으로 변경되었습니다.");

    } catch (Exception e) {
      e.printStackTrace();
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");
    }
  }


  //주문 상태 변경 (ex. 주문접수 → 배송중 → 배송완료 등)
  @PatchMapping("/status")
  public ApiResponse<String> updateOrderStatus(@RequestBody Order order) {
    try {
      // 1. 유효성 검사
      if (order.getOrderId() == null || order.getOrderStatus() == null || order.getOrderStatus().isBlank()) {
        return ApiResponse.of(ApiResponseCode.VALIDATION_ERROR, "주문 ID 또는 상태 값이 유효하지 않습니다.");
      }

      // 2. 상태 변경 처리
      int result = orderSVC.updateStatus(order);

      if (result == 0) {
        return ApiResponse.of(ApiResponseCode.ENTITY_NOT_FOUND, "주문 상태 변경 실패 또는 주문 ID가 존재하지 않습니다.");
      }

      return ApiResponse.of(ApiResponseCode.SUCCESS, "주문 상태가 성공적으로 변경되었습니다.");

    } catch (Exception e) {
      e.printStackTrace(); // 실무에서는 log.error(...)
      return ApiResponse.of(ApiResponseCode.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");
    }
  }




}
