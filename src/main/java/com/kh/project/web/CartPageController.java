package com.kh.project.web;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.kh.project.domain.cart.svc.CartSVC;
import com.kh.project.domain.entity.Cart;
import com.kh.project.domain.entity.Product;
import com.kh.project.domain.product.svc.ProductSVC;
import com.kh.project.web.buyer.CartItemDTO;
import com.kh.project.web.buyer.LoginForm;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CartPageController {

  final private CartSVC cartSVC;
  final private ProductSVC productSVC;

  // 장바구니 페이지
  @GetMapping("/buyer/cart/{bid}")
  public String cartPage(HttpSession session, Model model){

    LoginForm loginBuyer = (LoginForm) session.getAttribute("loginBuyer");

    if (loginBuyer == null){
      return "redirect:/buyer/login";
    }
    List<Cart> cartList = cartSVC.findByBuyerId(loginBuyer.getBuyerId());
    List<CartItemDTO> cartItems = cartList.stream().map(cart -> {
      Product product = productSVC.findById(cart.getProductId()).orElseThrow();
      CartItemDTO dto = new CartItemDTO();
      dto.setCartId(cart.getCartId());
      dto.setProductId(cart.getProductId());
      dto.setQuantity(cart.getQuantity());
      dto.setProductTitle(product.getTitle());
      dto.setProductThumbnail(product.getThumbnail());
      dto.setProductPrice(product.getPrice());
      dto.setDeliveryFee(product.getDeliveryFee());
      return dto;
    }).toList();

    model.addAttribute("cartItems", cartItems);
    return "buyer/buyer_cart";
  }
}
