# PoE Run Helper

Path of Exile 액트 진행에 필요한 공략, 액트런 타이머, 상점 검색 정규식, 액트 지도와 진행 가이드를 한곳에서 확인할 수 있는 정적 웹사이트입니다.

HTML, CSS, 순수 JavaScript만 사용하며 GitHub Pages에 바로 배포할 수 있습니다.

## 실행 방법

### 로컬에서 실행

보안 정책과 스크립트 로딩 문제를 피하기 위해 `index.html`을 직접 여는 것보다 VS Code 또는 Cursor의 **Live Server** 사용을 권장합니다.

1. 프로젝트 폴더를 VS Code 또는 Cursor로 엽니다.
2. Live Server 확장을 설치합니다.
3. `index.html`에서 **Open with Live Server**를 실행합니다.

### GitHub Pages 배포

1. GitHub 저장소에 프로젝트를 push합니다.
2. 저장소 **Settings → Pages** 메뉴로 이동합니다.
3. **Source**를 `Deploy from a branch`로 선택합니다.
4. 브랜치를 `main`, 폴더를 `/ (root)`로 설정합니다.
5. 저장 후 `https://<사용자명>.github.io/<저장소명>/` 주소에서 접속합니다.

> 모든 리소스 경로는 상대 경로로 작성되어 있어 GitHub Pages의 저장소 하위 경로에서도 동작합니다.

## 주요 기능

| 메뉴 | 설명 |
|------|------|
| **공략** | 카테고리 필터, 통합 검색, 카드 펼치기로 공략 상세 내용 확인 |
| **액트런 타이머** | 0.1초 단위 타이머, 액트 1~10 완료 기록, 마지막 기록 취소, 별도 창 실행 |
| **액트 상점 필터** | 링크 수와 장비 옵션을 조합해 상점 검색용 정규식 생성 |
| **액트 가이드** | 액트 1~10 일반 가이드와 스피드런 가이드 전환, 선택한 액트 지도 바로 열기 |
| **외부 링크** | PoE Wiki, poe.ninja 등 관련 사이트 바로가기 |

## 파일 구조

```text
poeInfo/
├── index.html
├── assets/
│   └── maps/
│       ├── act-1.png
│       ├── act-2.png
│       └── ...
├── css/
│   ├── style.css
│   └── act-guide.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── vendor-filter.js
│   ├── act-guide-data.js
│   ├── act-guide.js
│   └── act-maps.js
└── README.md
```

파일 이름이나 구성은 기능 추가 과정에서 달라질 수 있습니다.

## 공략 데이터 수정 방법

`js/data.js` 파일의 `GUIDE_DATA` 배열을 편집합니다.

```javascript
var GUIDE_DATA = [
  {
    id: 1,
    category: "액트런",
    title: "액트 1 진행 순서",
    summary: "액트 1의 주요 이동 경로와 퀘스트 정리",
    sections: [
      {
        heading: "해안 지대",
        items: [
          "첫 번째 진행 내용",
          "두 번째 진행 내용"
        ]
      }
    ]
  }
];
```

### `sections` 작성 규칙

- `sections`는 여러 개 작성할 수 있습니다.
- 각 section은 `heading`과 `items`를 사용합니다.
- `items`에는 일반 문자열 또는 링크 객체를 넣을 수 있습니다.
- 항목을 추가하면 공략 검색과 카테고리 필터에 자동으로 반영됩니다.

링크 항목은 다음과 같이 작성합니다.

```javascript
{
  text: "관련 페이지 열기",
  url: "https://example.com"
}
```

`http` 또는 `https` 주소만 새 탭 링크로 표시되며, 주소가 없거나 올바르지 않으면 일반 텍스트로 표시됩니다.

## 공략 펼치기와 검색

- 공략 카드의 **내용 보기** 버튼을 누르면 상세 내용이 카드 아래에 펼쳐집니다.
- 여러 공략을 동시에 펼칠 수 있습니다.
- 검색 또는 카테고리 변경 후에도 펼친 상태는 공략 `id`를 기준으로 유지됩니다.
- 검색 대상은 제목, 카테고리, 요약, section 제목과 항목입니다.
- 영문 검색은 대소문자를 구분하지 않습니다.

## 액트런 타이머

- 시간은 `HH:MM:SS.d` 형식으로 표시됩니다.
- 액트 완료 순서를 강제하지 않습니다.
- 같은 액트를 여러 번 기록할 수 있습니다.
- 마지막으로 추가한 기록을 취소할 수 있습니다.
- `?mode=timer` 주소를 사용해 타이머만 별도 창으로 열 수 있습니다.
- 기본 페이지와 별도 창의 타이머는 서로 독립적으로 동작합니다.
- 새로고침하면 타이머와 기록이 초기화됩니다.

## 액트 상점 필터

액트 진행 중 상점 검색창의 **아이템 강조하기**에 붙여넣을 정규식을 생성합니다.

### 링크 조건

3.29의 기본 흰 소켓을 포함하도록 소켓 색상을 `[rgbw]`로 검색합니다.

```text
2링크 이상: [rgbw]-[rgbw]
3링크 이상: [rgbw]-[rgbw]-[rgbw]
4링크 이상: [rgbw]-[rgbw]-[rgbw]-[rgbw]
```

3링크 검색식은 4링크 이상의 문자열에도 포함되므로 **3링크 이상** 조건으로 동작합니다.

링크 조건과 추가 옵션, 직접 입력 키워드는 `|`로 연결되어 하나라도 일치하면 강조됩니다.

직접 입력한 키워드는 정규식 문법이 아닌 일반 문자로 처리합니다.

## 액트 지도

- 액트 1장부터 10장까지 지역 연결 지도를 제공합니다.
- 이전 장과 다음 장으로 이동할 수 있습니다.
- 확대, 축소, 화면 맞춤을 지원합니다.
- 마우스 휠로 확대하거나 축소할 수 있습니다.
- 확대된 지도는 드래그해서 이동할 수 있습니다.
- `ESC` 또는 배경 클릭으로 닫을 수 있습니다.

지도 이미지는 다음 경로에 저장합니다.

```text
assets/maps/act-1.png
assets/maps/act-2.png
...
assets/maps/act-10.png
```

## 액트 가이드

`js/act-guide-data.js`의 `ACT_GUIDE_DATA` 객체에서 일반 가이드와 스피드런 가이드를 관리합니다.

```javascript
var ACT_GUIDE_DATA = {
  normal: {
    1: {
      title: "1장 진행 순서",
      summary: "일반 진행 설명",
      steps: [
        {
          area: "해안 지대",
          action: "진행할 내용",
          tags: ["필수", "웨이포인트"],
          note: "추가 설명"
        }
      ]
    }
  },
  speedrun: {
    1: {
      title: "1장 스피드런 동선",
      summary: "이동 낭비를 줄인 진행 순서",
      steps: [
        {
          area: "해안 지대 → 갯벌",
          action: "빠른 진행 내용",
          tags: ["웨이포인트", "강종"]
        }
      ]
    }
  }
};
```

- `normal`은 상세한 일반 진행용 가이드입니다.
- `speedrun`은 포탈, 웨이포인트, 마을 복귀와 강종 타이밍 중심의 축약 가이드입니다.
- 액트 버튼을 누르면 해당 장의 가이드와 지도 보기 버튼이 함께 변경됩니다.
- 가이드 작성 시 [poe.gy 일반 액트 가이드](https://poe.gy/act)와 [poe.gy 스피드런 가이드](https://poe.gy/act/speedrun)의 진행 흐름을 참고하고, 사이트 용도에 맞게 문장을 재작성·요약했습니다.

## 외부 링크 수정 방법

`js/data.js`의 `EXTERNAL_LINKS` 배열을 편집합니다.

```javascript
var EXTERNAL_LINKS = [
  {
    name: "사이트 이름",
    description: "카드에 표시할 설명",
    url: "https://example.com"
  }
];
```

외부 링크는 새 탭에서 열립니다.

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages

React, Vue, TypeScript, Node.js, npm, 백엔드와 데이터베이스는 사용하지 않습니다.

## 참고 및 주의사항

- Path of Exile 패치로 퀘스트, 보상, 젬, 상점 검색 규칙이 변경될 수 있습니다.
- 액트 가이드와 공략 데이터는 새로운 리그 시작 전 확인이 필요합니다.
- 지도와 가이드 내용에 오류가 있을 경우 `js/data.js`, `js/act-guide-data.js` 또는 지도 이미지를 수정합니다.

## 라이선스

비공식 팬 프로젝트입니다.

Path of Exile는 Grinding Gear Games의 등록상표입니다. 게임 관련 이미지, 명칭과 데이터의 권리는 각 권리자에게 있습니다.
