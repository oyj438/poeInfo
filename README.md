# PoE Info

Path of Exile 공략 정리, 액트런 타이머, 외부 링크를 제공하는 정적 웹사이트입니다.

HTML, CSS, 순수 JavaScript만 사용하며 GitHub Pages에 바로 배포할 수 있습니다.

## 실행 방법

### 로컬에서 바로 열기

1. 프로젝트 폴더에서 `index.html` 파일을 더블클릭하거나 브라우저로 드래그합니다.
2. 서버 없이도 공략 목록, 타이머, 외부 링크 기능이 동작합니다.

### GitHub Pages 배포

1. GitHub 저장소에 이 프로젝트를 push합니다.
2. 저장소 **Settings → Pages** 메뉴로 이동합니다.
3. **Source**를 `Deploy from a branch`로 선택하고, 브랜치를 `main`(또는 `master`), 폴더를 `/ (root)`로 설정합니다.
4. 저장 후 몇 분 뒤 `https://<사용자명>.github.io/<저장소명>/` 주소에서 접속할 수 있습니다.

> 모든 리소스 경로는 상대 경로(`css/style.css`, `js/app.js` 등)로 작성되어 있어 GitHub Pages 하위 경로에서도 정상 동작합니다.

## 파일 구조

```
poeInfo/
├── index.html      # 메인 HTML
├── css/
│   └── style.css   # 스타일 (다크 테마, 반응형)
├── js/
│   ├── data.js     # 공략·외부 링크 데이터
│   └── app.js      # 탭, 공략, 타이머, 링크 로직
└── README.md
```

## 공략 데이터 수정 방법

`js/data.js` 파일의 `GUIDE_DATA` 배열을 편집합니다.

```javascript
var GUIDE_DATA = [
  {
    id: 1,                          // 고유 번호 (중복되지 않게)
    category: "시즌 시작",           // 카테고리 (필터에 자동 반영)
    title: "공략 제목",
    summary: "목록에 표시되는 짧은 설명",
    content: "모달에 표시되는 상세 내용\n\n줄바꿈은 \\n 사용"
  },
  // ... 항목 추가
];
```

- 항목을 추가하면 목록과 카테고리 필터에 자동으로 반영됩니다.
- `content` 안에서 `\n`은 줄바꿈으로 표시됩니다.

## 외부 링크 수정 방법

같은 파일(`js/data.js`)의 `EXTERNAL_LINKS` 배열을 편집합니다.

```javascript
var EXTERNAL_LINKS = [
  {
    name: "사이트 이름",
    description: "카드에 표시할 설명",
    url: "https://example.com"
  },
  // ... 항목 추가
];
```

링크는 새 탭(`target="_blank"`)에서 열립니다.

## 주요 기능

| 메뉴 | 설명 |
|------|------|
| **공략** | 카테고리 필터, 제목 검색, 클릭 시 모달로 상세 보기 |
| **액트런 타이머** | 시작/일시정지/재개/초기화, Act 1~10 구간 기록, 마지막 기록 취소 |
| **외부 링크** | poe.ninja, PoE Wiki 등 외부 사이트 카드 링크 |

### 타이머 참고

- 시간 계산은 `Date.now()` 기준이라 브라우저 탭이 백그라운드여도 크게 어긋나지 않습니다.
- 새로고침하면 타이머와 액트 기록이 초기화됩니다 (의도된 동작).

## 기술 스택

- HTML5
- CSS3 (Flexbox, Grid, 미디어 쿼리)
- Vanilla JavaScript (ES5 호환 문법)

React, Vue, TypeScript, Node.js, npm, 백엔드, 데이터베이스는 사용하지 않습니다.

## 라이선스

비공식 팬 프로젝트입니다. Path of Exile는 Grinding Gear Games의 등록상표입니다.
