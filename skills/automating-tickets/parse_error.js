const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

// Find inputs in the post response HTML
const inputs = html.match(/<input[^>]*>/g) || [];
console.log('Found inputs count in post response:', inputs.length);
inputs.forEach(inp => {
  if (inp.includes('fields') || inp.includes('value')) {
    console.log('  Input:', inp);
  }
});

const textareas = html.match(/<textarea[^>]*>[\s\S]*?<\/textarea>/g) || [];
console.log('Found textareas in post response:', textareas);

// Let's print the plainText from 1000 onwards to see where the form is
const plainText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]*>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();

console.log('Plain text from 1000 to 2000:');
console.log(plainText.substring(1000, 2000));
