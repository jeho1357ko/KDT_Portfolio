package com.kh.project.domain.entity;

import java.sql.Timestamp;
import java.util.Date;

import lombok.Data;

@Data
public class Buyer {
  private Long buyerId;             // 구매자 아이디
  private String email;             // 이메일
  private String password;          // 비밀번호
  private String tel;               // 전화번호
  private String name;              // 이름
  private String nickname;          // 닉네임
  private String gender;            // 성별
  private Date birth;               // 생년월일
  private Long postNumber;          // 우편번호
  private String address;           // 주소
  private String status;            // 상태 '활성화','비활성화','정지','탈퇴'
  private byte[] pic;               // 프로필 이미지
  private Timestamp cdate;          // 생성일
  private Timestamp udate;          // 수정일
  private Timestamp withdrawnAt;    // 탈퇴일
  private  String withdrawnReason;  // 탈퇴 사유
}
