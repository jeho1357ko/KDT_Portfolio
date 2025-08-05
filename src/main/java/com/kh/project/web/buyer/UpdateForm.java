package com.kh.project.web.buyer;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
public class UpdateForm {
  // 이메일
  @Email
  @NotBlank
  private String email;

  // 비밀번호
  @Size(min = 8, max = 15)
  @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*]).+$", message = "영문자, 숫자, 특수문자를 포함해야 합니다.")
  private String password;

  // 비밀번호 확인
  @Size(min = 8, max = 15)
  private String passwordConfirm;

  // 이름
  @NotBlank
  private String name;

  // 닉네임
  @NotBlank
  private String nickname;

  // 전화번호
  @NotBlank
  @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 맞지 않습니다. 예) 010-1234-5678")
  private String tel;
  
  // 성별
  private String gender;

  // 생년월일
  @Past
  @DateTimeFormat(pattern = "yyyy-MM-dd")
  private LocalDate birth;

  // 우편번호
  private String postNumber;

  // 주소
  private String address;

  // 상세주소
  private String detailAddress;
}
