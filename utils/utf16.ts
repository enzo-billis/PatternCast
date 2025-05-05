export function decodeUTF16BE(hex: string): string {
  const hexMatch = hex.match(/.{1,2}/g);
  if (!hexMatch) return hex;
  const bytes = Uint8Array.from(hexMatch.map((h) => parseInt(h, 16)));

  // Enlever le BOM si présent
  const hasBOM = bytes[0] === 0xfe && bytes[1] === 0xff;
  const startIndex = hasBOM ? 2 : 0;

  let result = "";
  for (let i = startIndex; i < bytes.length; i += 2) {
    const codeUnit = (bytes[i] << 8) | bytes[i + 1];
    result += String.fromCharCode(codeUnit);
  }

  return result;
}
