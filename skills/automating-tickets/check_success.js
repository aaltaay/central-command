const fs = require('fs');
if (fs.existsSync('auto_post_response.html')) {
  const html = fs.readFileSync('auto_post_response.html', 'utf8');
  console.log('Includes Success:', html.includes('successfully sent') || html.includes('success') || html.includes('Your message has been successfully sent') || html.includes('Your message has been successfully sent to our team'));
  console.log('Includes Error:', html.includes('error') || html.includes('invalid') || html.includes('reCAPTCHA'));
  const match = html.match(/class="[^"]*alert[^"]*">([\s\S]*?)<\/(div|section|article)>/i);
  console.log('Alert text:', match ? match[1].replace(/<[^>]*>/g, '').trim() : 'No alert block found');
} else {
  console.log('File not found');
}
