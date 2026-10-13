# 보안 설계

작은 사이트지만 사용자 입력(방명록)과 관리자 로그인이 있어서, 아래를 적용했습니다.

| 위협 | 대응 | 위치 |
|---|---|---|
| 비밀 값 유출 | DB 주소, 비밀번호, 서명 키는 환경 변수로만 사용. `.env*`는 git 제외, `.env.example`에는 값 없음 | `.gitignore`, `.env.example` |
| NoSQL 인젝션 | 입력은 문자열만 허용하고 객체나 배열이 오면 거부. 쿼리에 사용자 입력 객체를 그대로 넣지 않음 | `lib/validate.js` |
| XSS | React 자동 이스케이프, `dangerouslySetInnerHTML` 미사용, URL은 http(s)·mailto·`/` 경로만 허용(`javascript:` 차단), CSP | `lib/validate.js`, `next.config.mjs` |
| 클릭재킹 | `frame-ancestors 'none'`, `X-Frame-Options: DENY` | `next.config.mjs` |
| 외부 iframe | 유튜브는 `youtube-nocookie.com`만 허용하고 `sandbox` 적용. 아이디 11자만 추출해 임베드 | `StationBody.jsx`, `validate.js` |
| 관리자 무차별 대입 | IP당 10분 5회 제한, 실패 시 지연, 비밀번호는 timing-safe 비교 | `api/admin/login` |
| 세션 탈취·위조 | HMAC 서명 토큰(8시간), 쿠키는 httpOnly, secure(운영), sameSite=strict | `lib/auth.js` |
| CSRF | 쓰기 요청은 Origin이 Host와 같을 때만 허용 + sameSite=strict | `lib/auth.js`, `lib/api.js` |
| 방명록 스팸 | 숨김 입력칸(honeypot), IP 해시 기준 30초 간격 제한, 총 2000개 상한, 글자 수 제한 | `api/guestbook` |
| 개인정보 | IP는 원문이 아니라 해시로만 저장, 관리자 목록에도 노출하지 않음. 전화번호·주소는 받지 않음 | `lib/auth.js` |
| 과도한 요청 본문 | JSON 크기 제한 | `lib/api.js` |
| 정보 노출 | `X-Powered-By` 제거, 오류는 일반 메시지로 응답하고 상세는 서버 로그에만 | `lib/api.js` |
| 전송 구간 | HSTS, Referrer-Policy, Permissions-Policy, nosniff | `next.config.mjs` |
| 최소 권한 | DB 사용자는 이 DB의 readWrite만 부여 (README 참고) | 운영 설정 |
| DB 장애 | 시드 데이터로 대체해 읽기 화면은 계속 동작 | `lib/data.js` |

## 알려진 한계

- 로그인 시도 제한은 서버 메모리에 저장되어, 서버리스에서 인스턴스가 나뉘면 완벽하지 않습니다 (비밀번호 길이로 보완).
- Atlas는 Vercel에서 접속하려면 `0.0.0.0/0` 허용이 필요합니다. DB 비밀번호와 권한으로 보완합니다.
- CSP에 `'unsafe-inline'` 스크립트가 있습니다 (Next.js 기본 인라인 스크립트 때문). nonce 방식으로 줄이는 것이 다음 개선 과제입니다.
- 관리자 계정은 비밀번호 1개입니다. 2단계 인증은 없습니다.

## 의존성 점검 (`npm audit`)

2026-10-13 기준 보고된 항목은 Next.js 내부에 포함된 PostCSS 관련 2건입니다. 빌드 시점에 우리 CSS만 처리하고 외부가 보낸 CSS를 처리하지 않아 실제로 악용될 경로는 없다고 판단했고, Next.js 업데이트가 나오면 올립니다. `npm audit fix --force`는 주요 버전을 바꾸므로 쓰지 않았습니다.
