---
project: "AI 기반 블루스캔 타깃 공략 에이전트"
owner: "B팀"
updated_date: "2026-06-10"
implementation_mode: "M0"
selected_stack_id: "S0"
---

# 구현 명세서 (`BUILD_SPEC.md`)

> PRD(`AI 기반 블루스캔 타깃 공략 에이전트`)와 Claude Design 목업(`에스원 디자인 (4)`)을 기반으로
> 실제 앱(`/app`)을 구현하며 채운 표준 문서다.

## 6. 프로젝트 선택 (`Project Selection`)

| 항목 (`Field`) | 선택값 (`Selected Value`) | 허용값 (`Allowed Values`) |
| --- | --- | --- |
| 구현 모드 (`Mode ID`) | M0 | M0 / M1 / M2 / M3 |
| 추천 스택 (`Stack ID`) | S0 | S0 / S1 / S2 / S3 / S4 |
| UI (`UI ID`) | U0 (커스텀 S-1 디자인 시스템) | U0 / U1 / U2 / U3 |
| 하네스 (`Harness ID`) | H0 | H0 / H1 / H2 / H3 |
| 백엔드 (`Backend`) | none | none / Hono / FastAPI |
| 데이터 저장 (`Persistence`) | none (in-memory + localStorage 뷰 설정) | none / SQLite |
| 스트리밍 (`Streaming`) | no | yes / no |

선택 근거 (`Selection Rationale`):

- 핵심 요구사항(R1–R12)이 **규칙 기반 스코어링·필터·조회·CSV 다운로드**로, 화면·데이터 입력·계산·조회만 필요 → **M0 일반 앱**.
- AI 모델/에이전트 하네스가 필요 없으므로 **H0 (none)**. (방문결과 화면의 "AI 결과 분석"은 호스트의 `window.claude`가 있을 때만 동작하고, 없으면 로컬 휴리스틱으로 폴백 — 백엔드·API Key 불필요. 제약: 민감정보·API Key는 코드에 포함하지 않음.)
- 데이터는 예시 시드(`public/data/appdata.js`, 비식별)를 클라이언트에서 로드 → 백엔드/DB 불필요. 방문 결과는 세션 메모리에 보관하고 CSV로 내보내며, 뷰 설정만 localStorage에 저장.
- UI는 목업에 포함된 **S-1 커스텀 디자인 시스템 번들**을 그대로 사용(shadcn 대체) → U0 계열.
- 프론트엔드는 표준값대로 **React + Vite**, local-first.

## 7. PRD 기반 추가 항목 (`PRD-Based Additions`)

| 항목 (`Area`) | 추가 여부 (`Needed`) | 추가 내용 (`Addition`) | 필요한 이유 (`Reason`) |
| --- | --- | --- | --- |
| UI 컴포넌트 (`UI Components`) | yes | Leaflet 지도(타깃 분포 + 화재 오버레이, 히트맵), 경량 SVG 차트(막대/레이더/도넛), 점수 게이지, 방문결과 다이얼로그 | 후보 분포 시각화·우선순위 근거 제시(R2·R4)와 지역 밀집도 표현 |
| 데이터 처리 (`Data Processing`) | yes | 규칙 기반 스코어링 결과를 담은 시드 데이터 로드, 정렬/필터, NO_DATA 구분, 멸실·중복 제외 | R2·R3·R5·R10·R11 충족 (점수·근거·예외 케이스 시연) |
| 파일/업로드 (`Files or Uploads`) | yes (다운로드만) | 방문 결과/실적 CSV 다운로드(UTF-8 BOM) | R9 관리자 다운로드 |
| 외부 API (`External APIs`) | no | (실습은 예시 데이터로 목업; 건축물대장·화재 공개 API 실연동은 후속 과제) | PRD 범위 제외/후속 |
| 평가/테스트 (`Evals or Tests`) | no | (수동 시연 흐름으로 정상·경계·실패·중복 케이스 확인) | 실습 범위 |
| 기타 (`Other`) | yes | 역할 전환(영업사원/관리자), 음성 받아쓰기(Web Speech API, 미지원 시 샘플 시연) | 방문 결과 입력 편의(R8) |
