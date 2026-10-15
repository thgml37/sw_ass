바이브 카페 + Supabase 연결 버전

1) Supabase 테이블 만들기
- Supabase 대시보드에서 SQL Editor를 엽니다.
- supabase-setup.sql의 내용을 전부 붙여넣고 Run을 누릅니다.
- Table Editor에 public.orders 테이블이 생겼는지 확인합니다.

2) API 정보 입력하기
- Project Settings > API에서 Project URL과 publishable key를 찾습니다.
- 구형 대시보드에서 publishable key 대신 anon key가 보이면 그것을 써도 됩니다.
- supabase-config.js에서 YOUR_PROJECT_ID와 YOUR_SUPABASE_PUBLISHABLE_KEY를 실제 값으로 교체합니다.
- service_role 또는 secret key는 절대 프런트엔드 파일에 넣지 마세요.

3) 실행하기
- index.html을 브라우저에서 열거나 VS Code Live Server로 실행합니다.
- 음료를 선택하고 주문을 제출합니다.
- Supabase > Table Editor > orders에서 저장된 행을 확인합니다.

주의
- 이 데모는 공개 웹페이지에서 비로그인 방문자가 주문을 INSERT할 수 있도록 구성되어 있습니다. RLS로 SELECT/UPDATE/DELETE는 허용하지 않지만 공개 INSERT는 스팸 주문에 악용될 수 있습니다.
- 실제 서비스라면 CAPTCHA/요청 제한, 서버 검증(예: Edge Function), 가격 서버 측 재계산, 개인정보 보관·삭제 정책을 추가하세요.
- 브라우저의 주문 내역 모달은 현재 페이지에서 성공적으로 접수한 주문만 보여줍니다. 데이터베이스 전체 주문을 불러오지 않습니다.
- 내역 비우기는 현재 화면만 비우며 Supabase 데이터는 삭제하지 않습니다.
