package com.kh.project.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Seller {
  private Long sellerId;         // 판매자 아이디
  private String email;          // 이메일
  private String password;       // 비밀번호
  private String bizRegNo;       // 사업자 등록번호
  private String shopName;       // 상점 이름
  private String name;           // 이름
  private String shopAddress;    // 상점 주소
  private Long postNumber;       // 우편번호
  private String tel;            // 전화번호
  private String birth;          // 생년월일
  private byte[] pic;            // 프로필 이미지
  private LocalDateTime cdate;    // 생성일
  private LocalDateTime udate;    // 수정일
  private String status;          // 상태 '활성화','비활성화','정지','탈퇴'
}
