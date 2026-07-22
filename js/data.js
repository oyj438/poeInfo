/**
 * data.js - 사이트에서 사용하는 정적 데이터
 *
 * 공략이나 외부 링크를 추가·수정할 때는 이 파일만 편집하면 됩니다.
 * HTML을 수정할 필요는 없습니다.
 */

// ===== 공략 데이터 =====
// id: 고유 번호, category: 분류, title: 제목, summary: 목록에 보이는 요약, content: 상세 내용
var GUIDE_DATA = [
  {
    id: 1,
    category: "시즌 시작",
    title: "리그 초반 1~10액트 빠른 진행 팁",
    summary: "스킬 젬, 플라스크, 보스 전 준비물을 정리한 초반 가이드입니다.",
    content:
      "1. 액트 1~3: 이동 속도가 가장 중요합니다. 플라스크 슬롯을 빠르게 확보하세요.\n\n" +
      "2. 액트 4~6: 저항력(특히 화염/번개)을 75%에 가깝게 맞추세요.\n\n" +
      "3. 액트 7~10: 보스전 전에 포탈 스크롤과 순간이동을 충분히 준비하세요.\n\n" +
      "4. 공통: 퀘스트 보상 젬은 빌드와 맞는지 확인 후 선택하고, 불필요한 사이드 퀘스트는 나중에 해도 됩니다."
  },
  {
    id: 2,
    category: "빌드",
    title: "초보자 추천 스타터 빌드 - 번개 화살 사냥꾼",
    summary: "저비용으로 리그를 시작하기 좋은 원거리 번개 빌드 소개.",
    content:
      "핵심 스킬: 번개 화살 (Lightning Arrow)\n\n" +
      "보조 젬 추천:\n" +
      "- 초반: 고속 발사, 추가 투사체\n" +
      "- 중반: 연쇄, 생명력 흡수\n\n" +
      "장비 우선순위:\n" +
      "1. 활 공격 속도 / 물리 피해\n" +
      "2. 생명력과 저항\n" +
      "3. 이동 속도가 붙은 장화\n\n" +
      "맵핑 전환 시에는 생존력(생명력 4~5k, 저항 75%)을 먼저 확보하세요."
  },
  {
    id: 3,
    category: "경제",
    title: "초반 카오스 수급 방법",
    summary: "리그 초반에 바로 적용할 수 있는 간단한 재화 파밍 팁.",
    content:
      "액트·초반 맵에서 할 수 있는 것:\n\n" +
      "• 희귀 등급 장비 vendor(판매) → 카오스/recipe 활용\n" +
      "• 6소켓 아이템 → 7 jeweller's orb 레시피\n" +
      "• RGB 연결 6소켓 → 1 chromatic orb\n\n" +
      "맵핑 시작 후:\n" +
      "• 알chemy 가능한 희귀 맵 우선 플레이\n" +
      "• divination card와 league mechanic(리그 메카닉) 우선\n\n" +
      "poe.ninja에서 수요 높은 유니크/카드 가격을 확인하면 판매 타이밍을 잡기 쉽습니다."
  },
  {
    id: 4,
    category: "보스",
    title: "맵 보스 & Atlas 기초",
    summary: "맵 보스 처치와 Atlas 진행의 기본 흐름을 정리했습니다.",
    content:
      "맵 보스 기본:\n" +
      "1. 맵 내 몬스터 100% 처치 (또는 맵 타입에 따라 보스만)\n" +
      "2. 맵 보스 방 진입 → 포탈 미리 열기\n" +
      "3. 보스 기믹 숙지 (독 장판, 순간이동 등)\n\n" +
      "Atlas:\n" +
      "• 같은 지역의 맵을 여러 번 깨면 해당 지역 Atlas passive 포인트 획득\n" +
      "• Maven, Voidstone 등 endgame 콘텐츠는 Atlas 진행도에 따라 해금\n\n" +
      "처음에는 Tier 1~5 맵에서 생존과 속도를 익힌 뒤 점진적으로 tier를 올리세요."
  }
];

// ===== 외부 링크 데이터 =====
// name: 사이트 이름, description: 설명, url: 이동할 주소
var EXTERNAL_LINKS = [
  {
    name: "poe.ninja",
    description: "캐릭터 빌드, 아이템 가격, 리그 통계를 확인하는 사이트",
    url: "https://poe.ninja/"
  },
  {
    name: "PoE Wiki",
    description: "스킬, 아이템, 퀘스트 등 게임 정보 백과사전",
    url: "https://www.poewiki.net/"
  },
  {
    name: "Path of Building",
    description: "캐릭터 DPS·생존력을 시뮬레이션하는 빌드 플래너",
    url: "https://pathofbuilding.community/"
  },
  {
    name: "Official PoE",
    description: "Path of Exile 공식 웹사이트 및 패치 노트",
    url: "https://www.pathofexile.com/"
  },
  {
    name: "Craft of Exile",
    description: "아이템 crafting(제작) 확률 계산 도구",
    url: "https://craftofexile.com/"
  },
  {
    name: "PoEDB",
    description: "아이템 DB, 유니크 목록, league 정보 검색",
    url: "https://poedb.tw/kr/"
  }
];
