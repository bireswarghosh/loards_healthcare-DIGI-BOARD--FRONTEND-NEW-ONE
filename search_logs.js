import fs from 'fs';
import path from 'path';

const searchDir = './src';
const keyword = 'activity-log';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(keyword)) {
          results.push(filePath);
        }
      }
    }
  });
  return results;
}

console.log('Searching for keyword:', keyword);
const matches = walk(searchDir);
console.log('Matching files:', matches);
