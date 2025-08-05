package com.kh.project.web.api;

import lombok.Data;

@Data
public class LoginDTO {
  private String email;           // 이메일
  private String password;        // 비밀번호
}
