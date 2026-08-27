export const stripEmoji = (value = '') => {
  return String(value).replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u20E3\u{1F1E6}-\u{1F1FF}]/gu, '');
};

export const sanitizePlainText = (value = '') => {
  return stripEmoji(String(value)).replace(/\s+/g, ' ').trim();
};
