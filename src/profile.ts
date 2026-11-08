// 공식 사이트 접근 403: 아래는 확인 대기 학습용 설정이며 공식 재현으로 보증하지 않는다.
export const PROFILE = {
 name: "손해평가사 1차", rulesVerificationStatus: "pending",
 subjects: ["상법 보험편", "농어업재해보험법령", "재배학 및 원예작물학"] as const,
 perSubject: 25, questionCount: 75, durationMinutes: 90, choiceCount: 5,
 passRate: 0.6, cutoffRate: 0.4,
 officialSources: ["https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=9743", "https://www.law.go.kr/법령/농어업재해보험법시행령"],
} as const;
