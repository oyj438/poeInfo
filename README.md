# PoE Run Helper

Path of Exile 액트런 타이머, 공략 정리, 외부 링크를 제공하는 정적 웹사이트입니다.

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
    id: 1,                              // 고유 번호 (중복되지 않게)
    category: "액트런",                  // 카테고리 (필터에 자동 반영)
    title: "액트 1 진행 순서",
    summary: "액트 1의 주요 이동 경로와 퀘스트 정리",
    sections: [
      {
        heading: "해안 지대",            // 소제목
        items: [                         // 항목 목록 (배열)
          "첫 번째 진행 내용",
          "두 번째 진행 내용"
        ]
      },
      {
        heading: "갯벌",
        items: [
          "로아 둥지에서 문양 획득",
          "물에 잠긴 길 개방"
        ]
      }
    ]
  }
];
```

### sections 작성 규칙

- `sections`는 여러 개 작성할 수 있습니다.
- 각 section은 `heading`(소제목)과 `items`(문자열 배열)를 사용합니다.
- `items`가 비어 있거나 없어도 오류 없이 표시됩니다.
- `heading`만 있고 `items`가 없으면 소제목만 표시됩니다.
- 항목을 추가하면 목록과 카테고리 필터, 검색에 자동으로 반영됩니다.

## 공략 펼치기 사용법

- 공략 카드의 **내용 보기** 버튼을 누르면 카드 아래에 상세 내용이 펼쳐집니다.
- 다시 누르면 **내용 닫기**로 바뀌며 접힙니다.
- 여러 공략을 동시에 펼칠 수 있습니다.
- 검색·필터로 목록을 다시 그려도, 펼쳐 둔 공략은 id 기준으로 상태가 유지됩니다.
- 키보드: **내용 보기** 버튼에 포커스한 뒤 Enter 또는 Space로도 열고 닫을 수 있습니다.

## 검색 기능

검색창에서 다음 항목을 모두 검색합니다.

- 제목 (`title`)
- 카테고리 (`category`)
- 요약 (`summary`)
- sections의 소제목 (`heading`)
- sections의 항목 (`items`)

영문 검색은 대소문자를 구분하지 않으며, 검색어 앞뒤 공백은 자동으로 제거됩니다. 카테고리 필터와 함께 사용할 수 있습니다.

## 외부 링크 수정 방법

같은 파일(`js/data.js`)의 `EXTERNAL_LINKS` 배열을 편집합니다.

```javascript
var EXTERNAL_LINKS = [
  {
    name: "사이트 이름",
    description: "카드에 표시할 설명",
    url: "https://example.com"
  }
];
```

링크 카드에는 사이트 이름, 설명, "바로가기 ↗"만 표시되며 새 탭(`target="_blank"`)에서 열립니다.

## 주요 기능

| 메뉴 | 설명 |
|------|------|
| **공략** | 카테고리 필터, 통합 검색, 카드 펼치기로 상세 보기 |
| **액트런 타이머** | HH:MM:SS.d 형식, Act 1~10 구간 기록, 마지막 기록 취소 |
| **외부 링크** | poe.ninja, PoE Wiki 등 외부 사이트 카드 링크 |

### 타이머 참고

- 시간 계산은 `Date.now()` 기준이라 브라우저 탭이 백그라운드여도 크게 어긋나지 않습니다.
- 액트 기록 순서는 강제하지 않으며, 같은 액트도 다시 기록할 수 있습니다.
- 실행 중 / 일시정지 / 대기 상태가 화면에 표시됩니다.
- 새로고침하면 타이머와 액트 기록이 초기화됩니다 (의도된 동작).

## 기술 스택

- HTML5
- CSS3 (Flexbox, Grid, 미디어 쿼리)
- Vanilla JavaScript (ES5 호환 문법)

React, Vue, TypeScript, Node.js, npm, 백엔드, 데이터베이스는 사용하지 않습니다.

## 라이선스

비공식 팬 프로젝트입니다. Path of Exile는 Grinding Gear Games의 등록상표입니다.
