const getFormattedTime: (seconds: number) => string = (seconds: number) => {
  if (seconds < 3600) {
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  }

  return new Date(seconds * 1000).toISOString().substr(11, 8);
};

export default getFormattedTime;
