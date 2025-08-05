import requests
import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import json
from datetime import datetime
import os
import time

# Elasticsearch 연결 설정
es = Elasticsearch(['http://localhost:9200'])

# 공공데이터 API 기본 파라미터
base_url = "http://www.garak.co.kr/homepage/publicdata/dataJsonOpen.do"
base_params = {
    "id": "4315",
    "passwd": "busankh9970!",
    "dataid": "data58",
    "portal.templet": "false",
    "s_date": "20250731",
    "s_deal": "211",
    "p_pos_gubun": "3"
}

# 제한 없이 모든 데이터를 가져오는 함수
def download_unlimited_market_data():
    """공공데이터 API에서 제한 없이 모든 데이터를 다운로드하여 CSV로 저장"""
    try:
        print("공공데이터 API에서 모든 데이터를 다운로드하는 중...")
        
        all_items = []
        page = 1
        page_size = 1000  # 최대 페이지 크기
        
        while True:
            print(f"페이지 {page} 데이터를 가져오는 중...")
            
            # 페이지별 파라미터 설정
            params = base_params.copy()
            params.update({
                "pagesize": str(page_size),
                "pageidx": str(page)
            })
            
            try:
                response = requests.get(base_url, params=params, timeout=30)
                print(f"응답 상태 코드: {response.status_code}")
                
                # 응답 확인
                if response.status_code != 200:
                    print(f"API 요청 실패: {response.status_code}")
                    print(f"응답 내용: {response.text[:200]}")
                    break
                
                # JSON 파싱
                try:
                    data = response.json()
                except json.JSONDecodeError as e:
                    print(f"JSON 파싱 오류: {e}")
                    print(f"응답 내용: {response.text[:200]}")
                    break
                
                # 데이터 추출
                items = data.get("resultData", [])
                
                if not items:
                    print(f"페이지 {page}에서 데이터가 없습니다. 모든 데이터를 가져왔습니다.")
                    break
                
                all_items.extend(items)
                print(f"페이지 {page}: {len(items)}개 데이터 추가됨 (총 {len(all_items)}개)")
                
                # 다음 페이지로
                page += 1
                
                # API 호출 간격 조절 (서버 부하 방지)
                time.sleep(0.5)
                
                # 진행 상황 출력
                if page % 10 == 0:
                    print(f"진행 상황: {page}페이지 완료, 총 {len(all_items)}개 데이터 수집")
                    
            except requests.exceptions.RequestException as e:
                print(f"요청 오류: {e}")
                break
        
        if not all_items:
            print("데이터가 없습니다.")
            return None
        
        print(f"총 {len(all_items)}개의 시장가격 데이터를 가져왔습니다.")
        
        # DataFrame으로 변환
        df = pd.DataFrame(all_items)
        
        # 원본 CSV 파일 저장
        original_csv_path = 'market_price_data_unlimited_original.csv'
        df.to_csv(original_csv_path, index=False, encoding='utf-8-sig')
        print(f"원본 데이터가 '{original_csv_path}'에 저장되었습니다.")
        
        return original_csv_path
        
    except Exception as e:
        print(f"데이터 다운로드 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return None

# CSV 파일을 읽어서 전처리하고 가공된 CSV 생성
def process_csv_data(csv_path):
    """CSV 파일을 읽어서 전처리하고 가공된 CSV 생성"""
    try:
        print(f"'{csv_path}' 파일을 읽어서 전처리하는 중...")
        
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        
        # 가격 데이터 정리 (쉼표 제거)
        if 'AVG' in df.columns:
            df['AVG'] = df['AVG'].astype(str).str.replace(',', '')
        
        if 'PREAVG_1' in df.columns:
            df['PREAVG_1'] = df['PREAVG_1'].astype(str).str.replace(',', '')
            
        if 'PREAVG_2' in df.columns:
            df['PREAVG_2'] = df['PREAVG_2'].astype(str).str.replace(',', '')
        
        # 가공된 CSV 파일 저장
        processed_csv_path = 'market_price_data_unlimited_processed.csv'
        df.to_csv(processed_csv_path, index=False, encoding='utf-8-sig')
        
        print(f"전처리 완료: {len(df)}개 데이터")
        print(f"가공된 데이터가 '{processed_csv_path}'에 저장되었습니다.")
        
        return processed_csv_path
        
    except Exception as e:
        print(f"CSV 전처리 중 오류 발생: {e}")
        return None

# market_price_unlimited 인덱스 생성 (기존 인덱스가 있으면 삭제 후 재생성)
def create_market_price_index():
    """market_price_unlimited 인덱스 생성"""
    index_name = 'market_price_unlimited'
    
    # 기존 인덱스가 있으면 삭제
    if es.indices.exists(index=index_name):
        print(f"기존 인덱스 '{index_name}'를 삭제합니다.")
        es.indices.delete(index=index_name)
    
    # 인덱스 매핑 설정
    mapping = {
        "mappings": {
            "properties": {
                "AVG": {"type": "float"},
                "ROWNO": {"type": "integer"},
                "PREAVG_2": {"type": "float"},
                "MM_0": {"type": "keyword"},
                "PUM_NAME": {"type": "text", "analyzer": "standard"},
                "PREAVG_1": {"type": "float"},
                "MM_1": {"type": "keyword"},
                "UNIT_NAME": {"type": "keyword"},
                "MM_2": {"type": "keyword"},
                "GRADE_NAME": {"type": "keyword"},
                "data_stored_at": {"type": "date"}
            }
        }
    }
    
    # 인덱스 생성
    es.indices.create(index=index_name, body=mapping)
    print(f"인덱스 '{index_name}'가 성공적으로 생성되었습니다.")

# 데이터 클리닝 함수
def clean_record(record):
    """레코드 데이터 클리닝"""
    cleaned_record = {}
    
    for key, value in record.items():
        # NaN이나 None 값 처리
        if pd.isna(value) or value is None:
            cleaned_record[key] = ""
        # 숫자 필드 처리
        elif key in ['AVG', 'PREAVG_1', 'PREAVG_2']:
            try:
                # 쉼표 제거 후 숫자로 변환
                if isinstance(value, str):
                    value = value.replace(',', '')
                cleaned_record[key] = float(value) if value != "" else 0.0
            except (ValueError, TypeError):
                cleaned_record[key] = 0.0
        # 정수 필드 처리
        elif key in ['ROWNO']:
            try:
                cleaned_record[key] = int(float(value)) if value != "" else 0
            except (ValueError, TypeError):
                cleaned_record[key] = 0
        else:
            # 문자열 필드는 그대로 저장 (단, None은 빈 문자열로)
            cleaned_record[key] = str(value) if value is not None else ""
    
    return cleaned_record

# 가공된 CSV 파일을 읽어서 Elasticsearch에 저장
def load_csv_to_elasticsearch(csv_path):
    """가공된 CSV 파일을 읽어서 Elasticsearch에 저장"""
    try:
        print(f"'{csv_path}' 파일을 읽어서 Elasticsearch에 저장하는 중...")
        
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        print(f"CSV에서 {len(df)}개 레코드를 읽었습니다.")
        
        # 데이터 저장 시간 추가
        df['data_stored_at'] = datetime.now().isoformat()
        
        # DataFrame을 딕셔너리 리스트로 변환
        records = df.to_dict('records')
        
        index_name = 'market_price_unlimited'
        
        # 벌크 인덱싱을 위한 문서 생성 함수
        def doc_generator():
            for i, record in enumerate(records):
                # 데이터 클리닝
                cleaned_record = clean_record(record)
                
                yield {
                    "_index": index_name,
                    "_id": i + 1,  # 고유 ID 할당
                    "_source": cleaned_record
                }
        
        # 벌크 인덱싱 실행
        success_count = 0
        error_count = 0
        
        try:
            # bulk helper 사용
            for success, info in bulk(es, doc_generator(), chunk_size=500, timeout='60s'):
                if success:
                    success_count += 1
                else:
                    error_count += 1
                    print(f"인덱싱 실패: {info}")
                
                # 진행 상황 출력
                if (success_count + error_count) % 1000 == 0:
                    print(f"진행 상황: 성공 {success_count}개, 실패 {error_count}개")
        
        except Exception as e:
            print(f"벌크 인덱싱 중 오류 발생: {e}")
        
        print(f"인덱싱 완료: 성공 {success_count}개, 실패 {error_count}개")
        
        # 인덱스 새로고침
        es.indices.refresh(index=index_name)
        print("인덱스 새로고침 완료")
        
        # 저장된 문서 수 확인
        count_result = es.count(index=index_name)
        print(f"Elasticsearch에 저장된 문서 수: {count_result['count']}개")
        
    except Exception as e:
        print(f"CSV를 Elasticsearch에 저장하는 중 오류 발생: {e}")

# 시장가격 데이터 검색
def search_market_data(query_text):
    """시장가격 데이터 검색"""
    index_name = 'market_price_unlimited'
    
    search_body = {
        "query": {
            "multi_match": {
                "query": query_text,
                "fields": ["PUM_NAME^2", "GRADE_NAME", "UNIT_NAME"],
                "fuzziness": "AUTO"
            }
        },
        "size": 10
    }
    
    try:
        results = es.search(index=index_name, body=search_body)
        
        print(f"'{query_text}' 검색 결과:")
        print(f"총 {results['hits']['total']['value']}개 결과")
        print("-" * 50)
        
        for hit in results['hits']['hits']:
            source = hit['_source']
            print(f"ID: {hit['_id']}")
            print(f"품목명: {source.get('PUM_NAME', 'N/A')}")
            print(f"등급: {source.get('GRADE_NAME', 'N/A')}")
            print(f"단위: {source.get('UNIT_NAME', 'N/A')}")
            print(f"평균가격: {source.get('AVG', 'N/A')}원")
            print(f"기준월: {source.get('MM_0', 'N/A')}")
            print(f"점수: {hit['_score']:.2f}")
            print("-" * 30)
            
    except Exception as e:
        print(f"검색 중 오류 발생: {e}")

# 특정 품목의 가격 정보 조회
def get_price_by_product(product_name):
    """특정 품목의 가격 정보 조회"""
    index_name = 'market_price_unlimited'
    
    search_body = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"PUM_NAME": product_name}}
                ]
            }
        },
        "sort": [
            {"AVG": {"order": "desc"}}
        ],
        "size": 20
    }
    
    try:
        results = es.search(index=index_name, body=search_body)
        
        print(f"'{product_name}' 가격 정보:")
        print(f"총 {results['hits']['total']['value']}개 결과")
        print("-" * 50)
        
        for hit in results['hits']['hits']:
            source = hit['_source']
            print(f"품목명: {source.get('PUM_NAME', 'N/A')}")
            print(f"등급: {source.get('GRADE_NAME', 'N/A')}")
            print(f"단위: {source.get('UNIT_NAME', 'N/A')}")
            print(f"평균가격: {source.get('AVG', 'N/A')}원")
            print(f"전월가격: {source.get('PREAVG_1', 'N/A')}원")
            print(f"전전월가격: {source.get('PREAVG_2', 'N/A')}원")
            print(f"기준월: {source.get('MM_0', 'N/A')}")
            print("-" * 30)
            
    except Exception as e:
        print(f"가격 정보 조회 중 오류 발생: {e}")

# 인덱스 통계 조회
def get_index_stats():
    """인덱스 통계 조회"""
    index_name = 'market_price_unlimited'
    
    try:
        # 문서 수 조회
        count_result = es.count(index=index_name)
        print(f"총 문서 수: {count_result['count']}개")
        
        # 인덱스 정보 조회
        stats = es.indices.stats(index=index_name)
        print(f"인덱스 크기: {stats['indices'][index_name]['total']['store']['size_in_bytes']} bytes")
        
        # 품목별 통계
        print("\n품목별 통계:")
        aggs_body = {
            "size": 0,
            "aggs": {
                "product_count": {
                    "terms": {
                        "field": "PUM_NAME",
                        "size": 10
                    }
                }
            }
        }
        
        aggs_result = es.search(index=index_name, body=aggs_body)
        buckets = aggs_result['aggregations']['product_count']['buckets']
        
        for bucket in buckets:
            print(f"- {bucket['key']}: {bucket['doc_count']}개")
        
    except Exception as e:
        print(f"인덱스 통계 조회 중 오류 발생: {e}")

# 메인 함수
def main():
    """메인 함수"""
    print("공공데이터 시장가격 무제한 데이터 Elasticsearch 저장 프로그램")
    print("=" * 60)
    
    # Elasticsearch 연결 확인
    try:
        if es.ping():
            print("✓ Elasticsearch 연결 성공")
        else:
            print("✗ Elasticsearch 연결 실패")
            return
    except Exception as e:
        print(f"✗ Elasticsearch 연결 오류: {e}")
        print("Elasticsearch가 실행 중인지 확인해주세요.")
        return
    
    # 1단계: API에서 무제한 데이터 다운로드
    print("\n[1단계] API에서 무제한 데이터 다운로드")
    original_csv_path = download_unlimited_market_data()
    if not original_csv_path:
        print("✗ 데이터 다운로드 실패")
        return
    
    # 2단계: CSV 전처리
    print("\n[2단계] CSV 전처리")
    processed_csv_path = process_csv_data(original_csv_path)
    if not processed_csv_path:
        print("✗ CSV 전처리 실패")
        return
    
    # 3단계: Elasticsearch 인덱스 생성
    print("\n[3단계] Elasticsearch 인덱스 생성")
    create_market_price_index()
    
    # 4단계: 가공된 CSV를 Elasticsearch에 저장
    print("\n[4단계] Elasticsearch에 데이터 저장")
    load_csv_to_elasticsearch(processed_csv_path)
    
    # 5단계: 인덱스 통계 확인
    print("\n[5단계] 인덱스 통계 확인")
    get_index_stats()
    
    # 6단계: 검색 예제
    print("\n[6단계] 검색 예제")
    print("\n>>> 텍스트 검색:")
    search_market_data("사과")
    
    print("\n>>> 특정 품목 가격 정보:")
    get_price_by_product("사과")
    
    print("\n" + "=" * 60)
    print("✓ 프로그램 완료!")

if __name__ == "__main__":
    main() 