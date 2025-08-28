import requests
import pandas as pd
import json
import csv

# ✅ API URL + 파라미터
url = "http://www.garak.co.kr/homepage/publicdata/dataJsonOpen.do"
params = {
    "id": "4315",
    "passwd": "busankh9970!",
    "dataid": "data58",
    "pagesize": "100",
    "pageidx": "1",
    "portal.templet": "false",
    "s_date": "20250731",
    "s_deal": "211",
    "p_pos_gubun": "3"
}

# ✅ 데이터 요청
response = requests.get(url, params=params)
data = response.json()

print("== 응답 원문 ==")
print(json.dumps(data, indent=2, ensure_ascii=False))

# ✅ API 응답 구조에 맞게 수정
items = data.get("resultData", [])  # "list" -> "resultData"로 수정

print(f"응답 키들: {list(data.keys())}")
print(f"resultData 길이: {len(items) if items else 0}")

# ✅ "resultData" 안의 전체 항목을 DataFrame으로 변환
df = pd.DataFrame(items)

print(f"DataFrame 크기: {df.shape}")
print(f"DataFrame 컬럼: {list(df.columns)}")

# ✅ 모든 컬럼 CSV로 저장
df.to_csv("garak_data_all_columns.csv", index=False, encoding="utf-8-sig")

print("✅ CSV 저장 완료: garak_data_all_columns.csv")

# 데이터 유무 확인 로직을 좀 더 직관적으로 변경
if len(items) == 0: # items 리스트의 길이로 직접 확인
    print("❌ 데이터가 없습니다.")
else:
    print("✅ 데이터 수:", len(items)) # items의 길이 출력

