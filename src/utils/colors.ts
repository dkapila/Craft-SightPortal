type RGBColor = {
  r: number;
  g: number;
  b: number;
};

const safeParseInt = (v: any, radix: number = 10): number | null => {
  const parsed = parseInt(v, radix);
  return !Number.isNaN(parsed) ? parsed : null;
};

const toRGB: (c: string) => RGBColor = (c: string) => {
  if (c.startsWith('#')) {
    const r = safeParseInt(c.substring(1, 3), 16) ?? 0;
    const g = safeParseInt(c.substring(3, 5), 16) ?? 0;
    const b = safeParseInt(c.substring(5, 7), 16) ?? 0;
    return { r, g, b };
  } if (c.startsWith('rgb(')) {
    const parts = c.substr(4, c.length - 5).split(',');
    const r = safeParseInt(parts[0], 10) ?? 0;
    const g = safeParseInt(parts[1], 10) ?? 0;
    const b = safeParseInt(parts[2], 10) ?? 0;
    return { r, g, b };
  } if (c.startsWith('rgba(')) {
    const parts = c.substr(5, c.length - 6).split(',');
    const r = safeParseInt(parts[0], 10) ?? 0;
    const g = safeParseInt(parts[1], 10) ?? 0;
    const b = safeParseInt(parts[2], 10) ?? 0;
    return { r, g, b };
  }
  return { r: 127, g: 127, b: 127 };
};

const toFixed = (n: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

const withOpacity = (colorHexSring: string, percent: number) => {
  const { r, g, b } = toRGB(colorHexSring);
  return `rgba(${r},${g},${b},${toFixed(percent, 2)}%)`;
};

export default withOpacity;
