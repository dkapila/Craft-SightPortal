export const getFormattedTime: (seconds: number) => string = (seconds: number) => {
  if (seconds < 3600) {
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  }

  return new Date(seconds * 1000).toISOString().substr(11, 8);
};

export const getArticleReadingTime = (articleText: string): number => {
  const wordsPerMinute = 200;
  const numberOfWords = articleText.split(' ').length;
  const readTime = Math.ceil(numberOfWords / wordsPerMinute);

  return readTime;
};
