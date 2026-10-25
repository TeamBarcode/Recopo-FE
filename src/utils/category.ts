// 서버는 카테고리를 영문 코드로 주고받고, 화면은 한글 라벨을 쓰기 때문에 서로 변환함
const CATEGORY_CODE_BY_LABEL: Record<string, string> = {
  '콘텐츠/미디어': 'CONTENT_MEDIA',
  생활: 'LIFE',
  건강: 'HEALTH',
  '업무/도구': 'WORK_TOOLS',
  '개발/디자인': 'DEVELOPMENT_DESIGN',
  사람: 'PEOPLE',
  기타: 'ETC',
};

const CATEGORY_LABEL_BY_CODE = Object.fromEntries(
  Object.entries(CATEGORY_CODE_BY_LABEL).map(([label, code]) => [code, label]),
);

// 표에 없는 값은 그대로 둠(빈 값 등은 서버가 판단)
export const toCategoryCode = (label: string) => CATEGORY_CODE_BY_LABEL[label] ?? label;

export const toCategoryLabel = (code: string) => CATEGORY_LABEL_BY_CODE[code] ?? code;
