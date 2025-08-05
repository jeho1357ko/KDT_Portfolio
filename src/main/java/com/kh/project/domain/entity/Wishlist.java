package com.kh.project.domain.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Wishlist {

   private Long wishlistId;
   private Long buyerId;
   private Long productId;
   private LocalDateTime addedAt;
}