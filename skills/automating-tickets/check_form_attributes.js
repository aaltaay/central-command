const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

// Find the form
const formMatch = html.match(/<form[\s\S]*?>/gi);
console.log('Form tags found:', formMatch);

// Find the submit button
const buttonMatch = html.match(/<button[\s\S]*?<\/button>/gi) || [];
console.log('Found buttons:');
buttonMatch.forEach(btn => {
  if (btn.includes('submit') || btn.includes('Send') || btn.includes('send') || btn.includes('ticket')) {
    console.log('  Button:', btn);
  }
});

// Let's print the entire form block
const formBlock = html.match(/<form[\s\S]*?<\/form>/i);
if (formBlock) {
  console.log('--- Form Content ---');
  console.log(formBlock[0].substring(0, 3000));
} else {
  console.log('No form block found');
}
