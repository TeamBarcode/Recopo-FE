// 서버 시각은 UTC인데 시간대 표시(Z)가 없어서, 그대로 읽으면 한국 시간으로 잘못 해석돼 새벽 글의 날짜가 하루 전으로 나옴
export const parseServerDate = (iso: string): Date => {
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`);
};
