const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

const recaptchaDiv = html.match(/<div[^>]*g-recaptcha[^>]*>[\s\S]*?<\/div>/gi) || html.match(/recaptcha/gi) || [];
console.log('Recaptcha occurrences:', recaptchaDiv.length);
if (recaptchaDiv.length > 0) {
  console.log('Recaptcha matches (first 5):', recaptchaDiv.slice(0, 5));
}

// Check for any script blocks that load Google recaptcha API
const scripts = html.match(/<script[^>]*src="[^"]*recaptcha[^"]*"[^>]*>/gi) || [];
console.log('Recaptcha scripts:', scripts);

// Also search for any hidden inputs related to token or security
const tokens = html.match(/<input[^>]*token[^>]*>/gi) || html.match(/<input[^>]*csrf[^>]*>/gi) || [];
console.log('Security/token inputs:', tokens);
