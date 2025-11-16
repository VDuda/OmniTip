export function parseTip(text: string) {
  const t = text.toLowerCase();
  return t.includes('england') || t.includes('inglaterra');
}

export function maskPhone(phone: string) {
  return phone.slice(-4);
}
