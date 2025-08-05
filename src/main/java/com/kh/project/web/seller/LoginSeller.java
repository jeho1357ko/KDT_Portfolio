package com.kh.project.web.seller;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class LoginSeller {
  private Long sellerId;           // 판매자 아이디
  private String email;            // 이메일
  private String shopName;         // 상점 이름
  private String name;             // 이름

}
