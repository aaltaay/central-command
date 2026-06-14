const fs = require('fs');
const html = fs.readFileSync('auto_post_response.html', 'utf8');

// Find the form with id="form_2"
const startIdx = html.indexOf('id="form_2"');
if (startIdx !== -1) {
  const formHtml = html.substring(startIdx - 50, startIdx + 8000);
  // Find where the form ends
  const endIdx = formHtml.indexOf('</form>');
  if (endIdx !== -1) {
    const fullForm = formHtml.substring(0, endIdx + 7);
    console.log('--- Full Form 2 ---');
    console.log(fullForm);
  } else {
    console.log('Could not find form end tag');
  }
} else {
  console.log('Could not find form_2');
}
