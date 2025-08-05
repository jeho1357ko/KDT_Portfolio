package com.kh.project.web.buyer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpForm {

  // 이메일
  @NotBlank(message = "이메일은 필수입니다.")
  @Email(message = "유효한 이메일 형식이어야 합니다.")
  private String email;

  // 비밀번호
  @NotBlank(message = "비밀번호는 필수입니다.")
  @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,20}$", 
           message = "비밀번호는 8~20자의 영문과 숫자를 포함해야 합니다.")
  private String password;

//  // 비밀번호 확인
//  @NotBlank(message = "비밀번호 확인은 필수입니다.")
//  private String passwordConfirm;

  // 이름
  @NotBlank(message = "이름은 필수입니다.")
  @Size(min = 2, max = 10, message = "이름은 2~10자여야 합니다.")
  private String name;

  // 닉네임
  @NotBlank(message = "닉네임은 필수입니다.")
  @Size(min = 2, max = 15, message = "닉네임은 2~15자여야 합니다.")
  private String nickname;

  // 전화번호
  @NotBlank(message = "전화번호는 필수입니다.")
  @Pattern(regexp = "^01[0-9]-[0-9]{3,4}-[0-9]{4}$", message = "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)")
  private String tel;

  // 성별
  @NotBlank(message = "성별은 필수입니다.")
  private String gender;

  // 생년월일
  @NotBlank(message = "생년월일은 필수입니다.")
  private String birth; // 'yyyy-MM-dd'로 받고 컨트롤러에서 변환

  // 우편번호
  @NotBlank(message = "우편번호는 필수입니다.")
  @Pattern(regexp = "\\d{5}", message = "우편번호는 5자리 숫자입니다.")
  private String postNumber;

  // 주소
  @NotBlank(message = "주소는 필수입니다.")
  private String address;

  // 상세주소
  private String detailAddress;
}