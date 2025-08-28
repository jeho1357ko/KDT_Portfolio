import pandas as pd
import os

# 스크립트 기준 디렉터리 (python/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# CSV 파일 읽기 (python/ 폴더 내)
csv_path = os.path.join(SCRIPT_DIR, 'market_price_data_unlimited_processed.csv')
df = pd.read_csv(csv_path, header=None)
df.columns = ['AVG', 'ROWNO', 'PREAVG_2', 'MM_0', 'PUM_NAME', 'PREAVG_1', 'MM_1', 'UNIT_NAME', 'MM_2', 'GRADE_NAME']

print('사용 가능한 상품명 목록:')
print('=' * 50)

# 고유한 상품명 추출 및 정렬
unique_products = df['PUM_NAME'].unique()
sorted_products = sorted(unique_products)

for i, product in enumerate(sorted_products, 1):
    print(f'{i:2d}. {product.strip()}')

print(f'\n총 {len(sorted_products)}개 상품') 