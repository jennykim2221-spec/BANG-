# 뱅! 기본판 모바일 도움말

`bang-mobile-plan.md` 14번을 기준으로 만든 한국어 정적 웹앱입니다. React, TypeScript, Vite와 일반 CSS를 사용합니다. 기준 화면은 390×844 CSS px이며 320·430px에도 대응합니다.

## 실행

Node.js 24 환경에서 확인했습니다. 의존성 버전과 lockfile을 고정했습니다.

```powershell
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

브라우저에서 http://127.0.0.1:5173 을 열면 됩니다. 오프라인은 아래 프로덕션 빌드로 확인하세요. 개발 서버의 서비스 워커는 캐시하지 않습니다.

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5174
```

처음 온라인으로 열어 `오프라인에서 사용할 수 있어요`를 확인한 뒤 오프라인에서 사용할 수 있습니다. 새 버전은 업데이트 버튼으로 적용합니다.

## 구현 범위

- 학습 7단원, 준비 체크리스트, 가상 역할 질문, 순서 선택, 첫 턴 연습
- 기본판 게임 카드 22종, 80장, 캐릭터 16종
- 통합 검색, 한글 초성·영문명·별칭, 상황 판정 우선순위, 한글 조합 대기
- 공식 FAQ 11개 판정과 추가 규칙, 맥주·공격 방어·턴 시작·승패의 조건 질문
- 거리 도우미, 탈락 좌석 제외, 장비와 캐릭터 보정, 거리 하한 1
- 즐겨찾기 50개, 최근 열람 10개, 학습 진행 저장, 저장 불가 시 세션 유지
- 상세 주소와 공유, 뒤로가기와 필터·스크롤 복원, 오프라인 검색·열람

실제 비밀 역할이나 게임 손패를 기록하지 않습니다. 승패 판정은 이미 공개된 정보만 사용합니다. 영상 발언이나 타임스탬프는 작성하지 않았습니다.

## 구조

- `src/content/`: 검증 상태와 공식 자료 참조를 가진 정적 콘텐츠
- `src/domain/`: 검색, 거리, 조건 판정 함수
- `src/pages/`: 학습, 조건 질문, 거리 도우미
- `src/components/`: 검색창, 목록, 출처, 즐겨찾기
- `src/app/`: History API 경로와 스크롤 복원
- `src/storage/`: 버전이 있는 저장 데이터와 세션 대체 저장
- `tools/build-offline.mjs`: 앱 전체를 같은 버전으로 캐시하는 서비스 워커 생성
- `tests/`: 공식 결론 회귀, 콘텐츠 정합성, 모바일·오프라인·접근성 시험

공개 콘텐츠는 `verification: 'verified'`만 포함합니다. 변경 시 공식 규칙서 인쇄 페이지 또는 FAQ 번호를 확인하고 회귀 시험도 수정하세요. 한국어 카드명은 검색용 가칭이며 공식 번역이 아닙니다.

## 검증

```powershell
npm.cmd run lint
npm.cmd test
npx.cmd playwright install chromium webkit
npm.cmd run build
npm.cmd run test:ui
```

AC01~AC12 대응은 `docs/verification.md`, HTML 시험 보고서는 `playwright-report/index.html`, 화면 캡처는 `artifacts/`에서 확인할 수 있습니다.

## 배포

`dist/`를 HTTPS 정적 호스트의 루트에 배포하세요. 상세 주소를 `/index.html`로 돌려주는 SPA 설정이 필요합니다. Netlify용 `public/_redirects`가 포함되어 있습니다. 다른 호스트에서도 같은 fallback을 설정하세요. 서비스 워커는 HTTPS 또는 localhost에서 동작합니다. 외부 PDF·영상은 캐시 대상이 아닙니다.

실제 iPhone·Android의 키보드와 안전 영역, VoiceOver·TalkBack 검증, 초보자 5명 사용성 시험은 별도 확인이 필요합니다. 자동 시험을 실기기나 사용자 시험 결과로 표현하지 않습니다.
