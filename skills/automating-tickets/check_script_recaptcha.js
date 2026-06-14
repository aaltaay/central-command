const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

// Find all script tags containing ticket_captcha_loadCallback or recaptcha
const scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
scripts.forEach((scr, idx) => {
  if (scr.includes('captcha') || scr.includes('recaptcha') || scr.includes('loadCallback')) {
    console.log(`Script ${idx}:`, scr.substring(0, 1000));
  }
});
