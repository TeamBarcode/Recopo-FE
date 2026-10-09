// BE Category enum(card.domain.Category) ↔ 화면에 보이는 한글 라벨
// 아이디어·브레인스토밍 카드가 같은 enum을 씀
export const CATEGORY_LABEL_BY_CODE = {
  CONTENT_MEDIA: '콘텐츠/미디어',
  LIFE: '생활',
  HEALTH: '건강',
  WORK_TOOLS: '업무/도구',
  DEVELOPMENT_DESIGN: '개발/디자인',
  PEOPLE: '사람',
  ETC: '기타',
} as const;

export type CategoryCode = keyof typeof CATEGORY_LABEL_BY_CODE;
export type CategoryLabel = (typeof CATEGORY_LABEL_BY_CODE)[CategoryCode];

export const CATEGORY_CODE_BY_LABEL = Object.fromEntries(
  Object.entries(CATEGORY_LABEL_BY_CODE).map(([code, label]) => [label, code]),
) as Record<CategoryLabel, CategoryCode>;

// 화면 쪽 카테고리 state는 string이라 매핑에 없는 값이 들어올 수 있음 → 없으면 undefined
export const toCategoryCode = (label: string): CategoryCode | undefined =>
  CATEGORY_CODE_BY_LABEL[label as CategoryLabel];

export const toCategoryLabel = (code: CategoryCode): CategoryLabel => CATEGORY_LABEL_BY_CODE[code];
