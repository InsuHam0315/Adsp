# ADsP 시험 준비 CBT

데이터분석준전문가(ADsP) 시험 대비용 개인 학습 사이트입니다. React, Vite, Next.js, Node 빌드 도구 없이 순수 HTML/CSS/JavaScript로 구성해 GitHub Pages에서 바로 배포할 수 있습니다.

## 파일 구조

```text
adsp/
├─ index.html
├─ cbt/
│  ├─ adsp_basic_cbt.html
│  └─ adsp_mock_01.html
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
│  └─ adsp_mock_01_questions.js
├─ assets/
│  ├─ style.css
│  ├─ storage.js
│  └─ cbt.js
├─ source/
│  └─ README.md
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

## 추후 커스텀 도메인 연결

예정 도메인: `ist-adsp.kro.kr`

1. GitHub Pages 설정에서 Custom domain에 `ist-adsp.kro.kr` 입력
2. 도메인 DNS에서 `ist-adsp.kro.kr`이 GitHub Pages를 가리키도록 CNAME 설정
3. GitHub Pages에서 HTTPS 적용 확인
4. 설정 완료 뒤에만 저장소 루트에 `CNAME` 파일을 만들고 내용으로 `ist-adsp.kro.kr`을 넣습니다.

현재는 커스텀 도메인 설정 전이므로 `CNAME` 파일을 만들지 않았습니다.

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

## localStorage 저장 한계

- 학습기록과 오답노트는 `adspStudyData` 키로 같은 브라우저에만 저장됩니다.
- 브라우저 데이터 삭제 시 사라질 수 있습니다.
- 기기 간 자동 동기화는 없습니다.
- JSON 내보내기 기능으로 백업할 수 있습니다.

## 저작권 주의사항

- 공개 자료는 출처를 표시합니다.
- 유료 교재나 강의자료 원문을 무단 복제하지 않습니다.
- 사이트에는 학습용 요약·재구성 자료와 직접 작성한 해설을 반영합니다.
- 원본 바이너리 자료는 기본적으로 `.gitignore`로 제외해 공개 저장소 업로드를 방지합니다.
