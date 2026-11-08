# 2026-11-08 현재 인스턴스 검증

작업 디렉터리: `/workspace/Certified-Loss-Evaluator-CBT`.

| 검사 | 결과·범위 |
|---|---|
| 설치 | 첫 npm ci는 기본 cache 쓰기 ENOENT. `/tmp/cle-npm-cache` 사용으로 수정 후 npm ci 성공. TLS·lockfile integrity 검증 유지 |
| 단위 | npm test, exit 0, 12/12 통과. 기본 75개 스키마·보기 5개·중복·완료/대기 수, 법령 대기 제외, 75문항/90분/과목별 25문항, 평균 60%와 과목 40% 경계, 5번 답안·만료 후 수정 방지·중복 제출·복원, CSV·보기 재배치 중복, 랜덤 중복 채점 방지 |
| 빌드 | npm run build, exit 0. TypeScript 및 Vite production bundle |
| 브라우저 | PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test, exit 0, 최초 22/22 통과. Desktop Chrome 및 Pixel 7 에뮬레이션 |
| 메뉴 추가 | 확대 글자 조건의 8/8 추가 검사, exit 0. 원래 검사의 재집계가 아닌 추가 시나리오 |
| 입력 | Space 실제 keydown/up, 두 모드 선택 후 본문 포커스, 미응답·수정키·반복키·네이티브 버튼 보호, 마지막 문항 자동 제출 방지 |
| 실전 | 테스트 전용 fixture 사용. 75문항 응답·저장/복원·제출 확인 취소/확인·전체 해설·오답 필터·오답 재학습·90분 자동 제출과 재접속 중복 방지 |
| 랜덤/저장 | 기본 검수 완료 재배 문항만 추출·즉시 채점·오답 제거·북마크·통계·CSV 등록·검수 근거 승인·오류 원자 처리·백업 다운로드·확인 후 초기화·손상 원본 보존 |
| 메뉴 | 390×480, 740×360, 정상/확대 글자. 휠 및 CDP touchStart/touchMove/touchEnd 각각 입력. 실제 scrollTop 증가→하단 백업/초기화 뷰포트 진입 및 클릭→역방향 입력→scrollTop 0→대시보드 클릭. JS scrollTop 대입으로 입력 검사를 대체하지 않음 |
| 화면 | PC 1440×1000 및 모바일 390×480 전체 화면 캡처 육안 확인. 가로 넘침 없음, 상단 안내 배너·학습 기준 선택 없음 |
| 재생성 | python scripts/author_bank.py, exit 0. 데이터 SHA256 ebaa9f8491db0d4b8d4362ac97d1e9914d73b10dfb67843db5fa8b15b0f18053 동일 |
| 미실행 | 실기기/iOS/Safari/Firefox, iframe 내 입력·저장 차단, 실제 quota 초과 주입·장기 백그라운드 실측, 외부 전문가·공식 기준 대조 |
| 인수 미달 | 내부 검토 완료 25/1,000, 부족 975. 검증 대기 50. 기본 은행의 한 회 실전 분량 부족으로 시작 비활성화 |
| 공식 자료 | Q-Net 및 법령 원문 요청 프록시 403. 규칙은 확인 대기 설정, 기출·이용 조건 미확보 |
| 배포 | Pages API 사전 확인 최초 프록시 403에서 중단. main push·Actions·Pages 미실행. 공개 화면 미확인. 재시도 없음 |

브라우저 테스트의 실전 fixture는 검수 완료 데이터를 확보했다는 증거가 아닙니다. 30개 브라우저 시나리오 중 메뉴 검사는 동일 모바일 문맥을 두 프로젝트에서 실행하므로 서로 다른 실기기 30대 검사라는 뜻이 아닙니다.
