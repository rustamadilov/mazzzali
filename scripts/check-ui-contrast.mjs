const pairs = [
  ['Primary button text', '#FFFFFF', '#17634A', 4.5],
  ['Primary button gradient light end', '#FFFFFF', '#2B7D5C', 4.5],
  ['Light body text', '#16332A', '#EEF5F2', 4.5],
  ['Light muted text', '#60756D', '#FFFFFF', 4.5],
  ['Brand text on soft green', '#17634A', '#E6F5EB', 4.5],
  ['Dark body text', '#F2F8F4', '#101915', 4.5],
  ['Dark muted text', '#B6C7BE', '#17221D', 4.5],
];
function luminance(hex) {
  const rgb = hex.replace('#','').match(/.{2}/g).map(v => parseInt(v, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a,b) { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
let failed = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = contrast(fg,bg);
  const ok = r >= min;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${r.toFixed(2)}:1`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
