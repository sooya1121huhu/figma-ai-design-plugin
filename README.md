# Prompt to UI Generator

자연어 프롬프트를 입력하면 GPT를 통해 UI 페이지를 생성하는 Figma 플러그인입니다.

## 🚀 배포 정보

- **플러그인 이름**: Prompt to UI Generator
- **설명**: Enter a natural language prompt and generate a UI page with GPT.
- **네트워크 접근**: OpenAI API (https://api.openai.com)
- **아이콘**: 없음 (기본 Figma 아이콘 사용)

## 📋 배포 준비사항

1. **manifest.json** 설정 완료
2. **OpenAI API Key** 필요
3. **Figma Community** 배포 준비

---

Figma 플러그인 개발을 위한 기본 구조입니다.

## 📁 파일 구조

- `manifest.json` - 플러그인 설정 파일
- `code.ts` - 플러그인 메인 로직 (TypeScript)
- `plugin-ui.html` - 플러그인 UI HTML
- `ui.js` - 플러그인 UI JavaScript 로직

## 🚀 설치 및 실행

### 개발 환경 설정
1. **의존성 설치**
   ```bash
   npm install
   ```

2. **TypeScript 빌드**
   ```bash
   npm run build
   ```
   또는 실시간 빌드:
   ```bash
   npm run watch
   ```

### Figma 플러그인 실행
1. **Figma 데스크톱 앱에서 플러그인 개발 모드 활성화**
   - Figma 앱 실행
   - Plugins > Development > New Plugin
   - "Import plugin from manifest" 선택
   - `manifest.json` 파일 선택

2. **플러그인 실행**
   - Plugins > Development > Prompt to UI Generator 실행

## 🧪 테스트 방법

1. 플러그인을 실행하면 `plugin-ui.html`이 팝업으로 열립니다
2. "메시지 전송하기" 버튼을 클릭합니다
3. UI에서 "Hello from UI" 메시지가 `code.ts`로 전송됩니다
4. Figma 개발자 콘솔에서 메시지 수신을 확인할 수 있습니다
5. `code.ts`에서 응답 메시지를 UI로 전송합니다

## 📝 메시지 통신 구조

- **UI → Code**: `parent.postMessage()` 사용
- **Code → UI**: `figma.ui.postMessage()` 사용
- 메시지 타입: 
  - `hello-from-ui` / `response-from-code` (기본 통신)
  - `verify-api-key` / `verify-success` / `verify-fail` (API Key 인증)
  - `start-generation` / `generation-status` (디자인 생성)

## 🔑 API Key 인증 기능

1. **API Key 입력**: OpenAI API Key를 입력 필드에 입력
2. **형식 검증**: `sk-` 또는 `Bearer `로 시작하는지 확인
3. **저장**: 검증된 API Key를 Figma 클라이언트 스토리지에 저장
4. **상태 표시**: 인증 성공/실패 상태를 UI에 표시

## 🎨 디자인 생성 기능

### 📝 기획서 입력
- 텍스트 영역에 기획서를 입력
- "디자인 생성" 버튼으로 GPT 분석 시작

### 🔄 생성 프로세스
1. **Step 1**: 기획서를 UI 컴포넌트 리스트(JSON 배열)로 파싱
2. **Step 2**: 컴포넌트 리스트를 Figma 디자인 JSON으로 변환
3. **Step 3**: Figma 캔버스에 실제 컴포넌트 생성

### 📊 상태 표시
- "GPT 분석 중..." → "디자인 생성 중..." → "✅ 완료되었습니다!"
- 오류 발생 시 상세 메시지 표시

### 🎯 지원 컴포넌트 타입
- **text**: 텍스트 요소 (기본 크기: 300x60, 폰트 크기: 16px, 중앙 정렬)
- **frame**: 프레임 컨테이너 (Auto Layout 적용)
- **rectangle**: 사각형
- **ellipse**: 원형/타원형
- **중첩 구조**: children 배열로 계층적 구성

### 🎨 디자인 품질 개선사항
- **폰트 Fallback**: Inter → Roboto → Segoe UI → Arial 순서로 폰트 로드
- **Auto Layout**: 프레임에 자동 레이아웃 적용 (수직 정렬, 16px 간격, 24px 패딩)
- **자동 정렬**: x, y 좌표가 명시되지 않은 경우 자동으로 아래쪽 정렬
- **기본 크기**: 텍스트(300x60), 기타 요소(400x200) 기본값 적용
- **텍스트 스타일**: 중앙 정렬, 적절한 폰트 크기로 가독성 향상

## 🎨 UI 스타일

- Weddingbook 앱과 유사한 화이트와 코랄(다홍색) 컬러 사용
- 모던하고 깔끔한 디자인
- 반응형 버튼과 메시지 로그 표시 