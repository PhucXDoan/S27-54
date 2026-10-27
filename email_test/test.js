// Set up dependencies with `npm install`.
//
// Make a local `.env` file like:
// ```
//     SMTP_HOST=smtp.gmail.com
//     SMTP_PORT=465
//     SMTP_USER=GMAIL_NAME_HERE@gmail.com
//     SMTP_PASS=APP_PASSWORD_HERE
//     ALERT_TO=DESTINATION_HERE@gmail.com
// ```
//
// For the `SMTP_USER` account, ensure that 2FA is enabled.
// When it is, an "app password" can be made for the Google account: https://myaccount.google.com/apppasswords
// It'll look something like `abcd efgh ijkl mnop`. The spaces are okay.
//
// Run with `node --env-file=.env ./test.js`.
// Give it a couple seconds.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendAlert(subject, body) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ALERT_TO,
    subject,
    text: body,
  });
  console.log('Sent:', info.messageId);
}

sendAlert('TEST ALERT: Device 01', 'Test message from the capstone app.').catch((err) => console.error('Send failed:', err));
