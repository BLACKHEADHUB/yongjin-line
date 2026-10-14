# 보안 설계

사이트 내용은 코드에 고정되어 있고, 사용자가 값을 보낼 수 있는 곳은 방명록 하나뿐입니다.
관리자 로그인을 두지 않아서 계정 탈취나 무차별 대입 공격의 대상 자체가 없습니다.

| 위협 | 대응 | 위치 |
|---|---|---|
| 공격 표면 | 관리 화면과 쓰기 API를 없애고, 쓰기 가능한 곳을 방명록 하나로 줄임 | 전체 구조 |
| 비밀 값 유출 | DB 주소는 환경 변수로만 사용. `.env*`는 git 제외, `.env.example`에는 값 없음 | `.gitignore` |
| NoSQL 인젝션 | 입력은 문자열만 허용하고 객체가 오면 거부. 쿼리에 사용자 입력 객체를 넣지 않음 | `lib/validate.js` |
| XSS | React 자동 이스케이프, `dangerouslySetInnerHTML` 미사용, CSP | `next.config.mjs` |
| 클릭재킹 | `frame-ancestors 'none'`, `X-Frame-Options: DENY` | `next.config.mjs` |
| 외부 iframe | 유튜브는 `youtube-nocookie.com`만 허용하고 `sandbox` 적용, 영상 아이디 11자만 추출 | `StationBody.jsx` |
| CSRF | 방명록 쓰기는 Origin이 Host와 같을 때만 허용 | `lib/request.js`, `lib/api.js` |
| 방명록 스팸 | 숨김 입력칸(honeypot), 같은 IP 30초 간격 제한, 총 2000개 상한, 글자 수 제한, 본문 크기 제한 | `app/api/guestbook` |
| 개인정보 | IP는 원문이 아니라 해시로만 저장하고 응답에 포함하지 않음 | `lib/request.js` |
| 정보 노출 | `X-Powered-By` 제거, 오류는 일반 메시지로 응답하고 상세는 서버 로그에만 | `lib/api.js` |
| 전송 구간 | HSTS, Referrer-Policy, Permissions-Policy, nosniff | `next.config.mjs` |
| 최소 권한 | DB 사용자는 이 DB의 readWrite만 부여 | 운영 설정 |
| DB 장애 | 방명록만 꺼지고 나머지 화면은 DB 없이 그대로 동작 | `app/page.js` |

## 알려진 한계

- Atlas는 Vercel에서 접속하려면 `0.0.0.0/0` 허용이 필요합니다. DB 비밀번호와 최소 권한으로 보완합니다.
- CSP에 `'unsafe-inline'` 스크립트가 있습니다 (Next.js 기본 인라인 스크립트 때문). nonce 방식으로 줄이는 것이 다음 개선 과제입니다.

## 의존성 점검 (`npm audit`)

2026-10-13 기준 보고된 항목은 Next.js 내부에 포함된 PostCSS 관련 2건입니다. 빌드 시점에 우리 CSS만 처리하고 외부가 보낸 CSS를 처리하지 않아 실제로 악용될 경로는 없다고 판단했고, Next.js 업데이트가 나오면 올립니다. `npm audit fix --force`는 주요 버전을 바꾸므로 쓰지 않았습니다.
