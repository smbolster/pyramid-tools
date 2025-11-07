const fs = require('fs');

const filePath = 'app/tools/image-to-svg/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Remove lines 229-231 (0-indexed: 228-230)
const newLines = [
  ...lines.slice(0, 228),
  ...lines.slice(231)
];

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Fixed FileUploadZone props - removed lines 229-231');
