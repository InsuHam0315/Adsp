# ADsP 시험 준비 CBT

데이터분석준전문가(ADsP) 시험 대비용 개인 학습 사이트입니다. React, Vite, Next.js, Node 빌드 도구 없이 순수 HTML/CSS/JavaScript로 구성해 GitHub Pages에서 바로 배포할 수 있습니다.

## 파일 구조

```text
adsp/
├─ index.html
├─ account/
│  ├─ login.html
│  └─ profile.html
├─ cbt/
│  ├─ adsp_basic_cbt.html
│  ├─ adsp_mock_01.html
│  ├─ adsp_48_mock.html
│  ├─ adsp_web_44.html
│  ├─ adsp_web_45.html
│  ├─ adsp_web_46.html
│  └─ adsp_web_47.html
├─ materials/
│  ├─ index.html
│  ├─ pdf-summary.html
│  ├─ youtube-rClfO1GdmFM.html
│  ├─ youtube-zYTBA76aUCw.html
│  └─ youtube-adsp-student-notes.html
├─ notes/
│  ├─ index.html
│  ├─ data-understanding.html
│  ├─ data-analysis-planning.html
│  └─ data-analysis.html
├─ review/
│  └─ wrong-notes.html
├─ stats/
│  └─ study-record.html
├─ data/
│  ├─ adsp_basic_questions.js
│  ├─ adsp_mock_01_questions.js
│  ├─ adsp_48_questions.js
│  ├─ adsp_web_44_questions.js
│  ├─ adsp_web_45_questions.js
│  ├─ adsp_web_46_questions.js
│  └─ adsp_web_47_questions.js
├─ assets/
│  ├─ style.css
│  ├─ storage.js
│  ├─ auth.js
│  └─ cbt.js
├─ source/
│  ├─ README.md
│  └─ web_sources.md
└─ README.md
```

## 실행 방법

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000/`로 접속합니다.

## GitHub 저장소

원격 저장소: <https://github.com/InsuHam0315/Adsp.git>

## GitHub Pages 배포 방법

1. 변경사항을 `main` 브랜치에 push합니다.
2. GitHub 저장소의 Settings → Pages로 이동합니다.
3. Source를 `Deploy from a branch`로 선택합니다.
4. Branch를 `main`, 폴더를 `/root`로 선택합니다.
5. 배포 주소는 `https://insuham0315.github.io/Adsp/`입니다.

## 커스텀 도메인 연결

설정 도메인: `ist-adsp.kro.kr`

1. GitHub Pages 설정에서 Custom domain에 `ist-adsp.kro.kr` 입력
2. 도메인 DNS에서 `ist-adsp.kro.kr`이 GitHub Pages를 가리키도록 CNAME 설정
3. GitHub Pages에서 HTTPS 적용 확인
4. 저장소 루트의 `CNAME` 파일 내용이 `ist-adsp.kro.kr`인지 확인합니다.

현재 원격 저장소에 `CNAME` 파일이 추가되어 있으며 내용은 `ist-adsp.kro.kr`입니다.

## 새 문제집 추가 방법

1. `data/adsp_new_questions.js`처럼 새 문제 배열 파일을 만듭니다.
2. 각 문제는 `id`, `exam`, `subject`, `category`, `question`, `choices`, `answer`, `explanation`, `source` 필드를 포함합니다.
3. `cbt/adsp_new.html` 페이지를 만들고 `assets/storage.js`, 새 데이터 파일, `assets/cbt.js`를 불러옵니다.
4. `index.html`에 새 문제집 카드를 추가합니다.
5. 링크와 문제 수를 검증한 뒤 커밋합니다.

## source 자료 반영 방법

1. `source/`에 ADsP 자료 추가
2. Codex에게 새 자료 분석 요청
3. 문제·정답이 명확한 자료만 `data/*.js`로 변환
4. 개념 자료는 `notes/*.html`에 요약·재구성
5. 공개 자료는 `source` 필드나 README에 출처 표시
6. 유료 교재·강의자료로 보이는 자료는 원문 복제 금지
7. 변환 후 사람이 반드시 검수

현재 `source/ADsP_완벽대비요약노트_260103-unlocked.pdf`는 사용자가 소유 자료로 공개 가능함을 확인해 GitHub Pages 자료실에서 열 수 있게 했습니다. 기존 암호화 PDF는 중복 파일이므로 커밋 대상에서 제외합니다.

공개 웹 복원 후보는 `source/web_sources.md`에 따로 기록했습니다. 44~47회 CBT는 확인한 공개 후보의 출제 키워드와 ADsP 공식 범위를 바탕으로 재구성한 학습용 문제이며, 실제 시험 원문·선지와 동일함을 보장하지 않습니다.

## 로그인 / 회원가입

- `account/login.html`에서 로컬 계정을 만들 수 있습니다.
- 서버가 없는 정적 사이트이므로 실제 서버 인증이 아닙니다.
- 계정 정보와 학습기록은 같은 브라우저의 localStorage에 저장됩니다.
- 로그인하면 `adspStudyData:user:{아이디}` 키로 계정별 학습기록이 분리됩니다.
- 로그인하지 않은 상태의 기록은 기존 `adspStudyData` 키에 저장됩니다.

## localStorage 저장 한계

- 학습기록과 오답노트는 `adspStudyData` 키로 같은 브라우저에만 저장됩니다.
- 로그인한 경우 계정별 키로 분리되어 저장됩니다.
- 브라우저 데이터 삭제 시 사라질 수 있습니다.
- 기기 간 자동 동기화는 없습니다.
- JSON 내보내기 기능으로 백업할 수 있습니다.

## 저작권 주의사항

- 공개 자료는 출처를 표시합니다.
- 유료 교재나 강의자료 원문을 무단 복제하지 않습니다.
- 사이트에는 학습용 요약·재구성 자료와 직접 작성한 해설을 반영합니다.
- 원본 바이너리 자료는 기본적으로 `.gitignore`로 제외하고, 공개 권한이 확인된 자료만 예외 처리합니다.
