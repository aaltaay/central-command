const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

const sitekeyMatches = html.match(/sitekey['"]?\s*:\s*['"]([^'"]+)['"]/i) || html.match(/data-sitekey=['"]([^'"]+)['"]/i);
console.log('Sitekey match:', sitekeyMatches ? sitekeyMatches[0] : 'No sitekey found');
if (sitekeyMatches) {
  console.log('Extracted key:', sitekeyMatches[1]);
}
