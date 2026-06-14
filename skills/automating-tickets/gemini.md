# Automating Tickets

This directory contains Node.js scripts for programmatically submitting support tickets on websites (specifically `ninegear.to`) that are protected by Google reCAPTCHA v2.

## How it works
1. **Authentication:** The script leverages existing PHP Session cookies to execute requests as an authenticated user.
2. **CAPTCHA Bypass:** Uses the `2Captcha` API (`RecaptchaV2TaskProxyless`) to dynamically solve reCAPTCHA challenges in the background.
3. **Submission:** Submits the form payload directly using the standard Node.js `fetch` API. It properly mimics browser behavior (like sending an empty File object) to bypass backend PHP validation errors.

## Files
- `submit_ticket_auto.js`: The fully automated script that interacts with the 2Captcha API to solve the CAPTCHA and submits the form data via POST.
- `create_ticket.js`: An earlier Playwright-based script used for UI automation and manual intervention.

## Usage
Ensure you have set the `FULL_COOKIE` with your active `PrestaShop` and `PHPSESSID` cookies, and updated the `CAPTCHA_API_KEY` before running the automation script.
