import fs from 'fs';

const raw = fs.readFileSync('AccessControl_recovered.jsx', 'utf8').trim();
// The raw content is wrapped in quotes and has escaped characters.
// We can parse it as a JSON string to get the decoded value.
try {
  let decoded = raw;
  if (raw.startsWith('"') && raw.endsWith('"')) {
    decoded = JSON.parse(raw);
  } else {
    // If it's not a pure JSON string, try adding quotes or manual parse
    decoded = JSON.parse('"' + raw.replace(/"/g, '\\"') + '"');
  }
  fs.writeFileSync('src/pages/AccessControl.jsx', decoded, 'utf8');
  console.log('✓ Successfully wrote decoded AccessControl.jsx to src/pages/AccessControl.jsx');
} catch (err) {
  console.error('Failed to parse:', err);
  // Manual string unescape if JSON.parse fails
  let manual = raw;
  if (raw.startsWith('"') && raw.endsWith('"')) {
    manual = raw.slice(1, -1);
  }
  manual = manual.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  fs.writeFileSync('src/pages/AccessControl.jsx', manual, 'utf8');
  console.log('✓ Wrote manually parsed AccessControl.jsx to src/pages/AccessControl.jsx');
}
