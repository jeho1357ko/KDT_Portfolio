package com.kh.project.web.buyer;

import lombok.Data;

@Data
public class LoginForm {
  private String email;           // 이메일
  private  String password;       // 비밀번호
  private String name;            // 이름
  private String nickname;        // 닉네임
  private Long buyerId;           // 구매자 아이디

  // 생성자
  public LoginForm() {}

  // 생성자
  public LoginForm (Long buyerId,String email ,String name ,String nickname ){
    this.buyerId = buyerId;
    this.email = email;
    this.name = name;
    this.nickname = nickname;
  }
}


