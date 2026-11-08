# 기본 문제은행 확장 검토 기록

2026-11-08. 총 1,000개, 모두 자체 제작 및 내부 검토 상태. **전체 과목 구성을 충족한 손해평가사 실전 문제은행은 아닙니다.**

- 재배학 및 원예작물학 1,000개 / 상법 보험편 0개 / 농어업재해보험법령 0개.
- 기출 0 / 복원 0 / 개념 64 / 숫자 조건 변형 936 (24유형 × 39조건).
- 보험·법령 초안 50개는 drafts.json으로 분리 보존. 기본 학습과 완료 수 제외.
- 기존 검수 재배 25개 원문·ID·보기·정답·설명·메타데이터 보존 검증.
- 자동 검사: 1,000개 ID·정규화 본문 및 보기 순서 무관 중복 없음, 보기 5개·정답·타입·연도 null 검사.
- 24개 계산 유형의 전제와 식·단위를 내부 검토. Python Decimal과 독립 TypeScript 식으로 936개 재계산, 반올림 및 정답 번호·수치상 동치 보기 검사.
- 개념·설명 문장 내부 검토는 외부 전문가 검수 및 공식 출제기준/법령 대조와 다름. 공식 자료 접근은 이전 403 이후 재확인하지 않았으며 미열람 자료 인용 없음.
- 숫자 변화만 다른 문항은 같은 family로 기록. 중복 제거는 이를 독립 개념으로 간주한다는 의미가 아님.
- 초급 계산 훈련 중심. 작물별 실제 권장 시비량이나 관수량, 보험금 산정·법정 기준으로 사용하지 않음.
- 생성 입력·ID·순서 고정, 전체 데이터·초안·템플릿 재생성 바이트 일치 확인.

| 계산 family | 조건 변형 수 |
|---|---:|
| agronomy-area | 39 |
| agronomy-density | 39 |
| agronomy-germination | 39 |
| agronomy-purity | 39 |
| agronomy-seeding | 39 |
| agronomy-nutrient | 39 |
| agronomy-fertilizer | 39 |
| agronomy-water | 39 |
| agronomy-flow | 39 |
| agronomy-moisture | 39 |
| agronomy-drymass | 39 |
| agronomy-dryratio | 39 |
| agronomy-yield | 39 |
| agronomy-harvest | 39 |
| agronomy-loss | 39 |
| agronomy-samplemean | 39 |
| agronomy-fruit | 39 |
| agronomy-dilution | 39 |
| agronomy-concentration | 39 |
| agronomy-degree | 39 |
| agronomy-leafarea | 39 |
| agronomy-spacing | 39 |
| agronomy-retention | 39 |
| agronomy-efficiency | 39 |

기본 JSON SHA256: `be1c70733eaea41f7a15419799dab53252ed3710f16acc30a5e81a14cef39b83`

배포는 앞선 최초 차단 상태를 유지했습니다. 이번 요청에서는 main 푸시·Pages API·workflow 실행 및 다른 프로젝트 수정 없음.

이번 확장 후 검증: 단위 950/950 통과, Chromium PC·모바일 30/30 통과(실기기 아님), TypeScript·Vite production build 통과. Vite는 단일 JS 청크 500kB 초과 경고를 출력했습니다(현재 gzip 약 136.5kB). 검사 실패는 아니며 문제 데이터가 정적 번들에 포함되는 구조입니다. 실전 검사는 세 과목 테스트 fixture를 사용하며 공개 은행의 과목 부족을 해소했다는 뜻이 아닙니다.
