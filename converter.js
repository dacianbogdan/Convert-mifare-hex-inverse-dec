/** Four bytes only; separators must be consistent to avoid ambiguous input. */
export function convertUID(input) {
  const value = input.trim();
  if (!/^(?:[0-9a-f]{8}|[0-9a-f]{2}(:)[0-9a-f]{2}\1[0-9a-f]{2}\1[0-9a-f]{2}|[0-9a-f]{2}(-)[0-9a-f]{2}\2[0-9a-f]{2}\2[0-9a-f]{2}|[0-9a-f]{2}( )[0-9a-f]{2}\3[0-9a-f]{2}\3[0-9a-f]{2})$/i.test(value)) {
    throw new Error('Introdu exact 4 octeți HEX: 5D:B0:F6:D2, 5D-B0-F6-D2, 5D B0 F6 D2 sau 5DB0F6D2.');
  }
  const bytes = value.replace(/[: -]/g, '').toUpperCase().match(/../g);
  const reversed = [...bytes].reverse();
  return { hex: bytes.join(':'), reversed: reversed.join(':'), decimal: String(Number.parseInt(reversed.join(''), 16)) };
}
