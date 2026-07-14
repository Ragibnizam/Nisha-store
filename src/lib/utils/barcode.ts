/**
 * Generate a short, unique barcode.
 * Format: PREFIX + base36 timestamp + random chars.
 * Example: NS4KX9A (7-8 chars, easy to type and print)
 */
export function generateBarcode(prefix = 'NS'): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.floor(Math.random() * 36 * 36 * 36)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * Validate a barcode string.
 */
export function isValidBarcode(barcode: string): boolean {
  return /^[A-Z0-9]{3,20}$/.test(barcode);
}
