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
// Run with `npm run start`.
// Give it a couple seconds.

import nodemailer from 'nodemailer';





////////////////////////////////////////////////////////////////////////////////
//
// Configuration stuff.
//

const get_from_process_env = (name : string) : string => {

    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;

}

const config = {
    smtp_host   :        get_from_process_env('SMTP_HOST'),
    smtp_port   : Number(get_from_process_env('SMTP_PORT')),
    smtp_user   :        get_from_process_env('SMTP_USER'),
    smtp_pass   :        get_from_process_env('SMTP_PASS'),
    alert_to    :        get_from_process_env('ALERT_TO' ),
    threshold   : 100,
    cooldown_ms : 5 * 60 * 1000,
};





////////////////////////////////////////////////////////////////////////////////
//
// Stuff for emailing.
//

const transporter = nodemailer.createTransport({
    host   : config.smtp_host,
    port   : config.smtp_port,
    secure : config.smtp_port === 465,
    auth   : {
        user : config.smtp_user,
        pass : config.smtp_pass,
    },
});

const send_alert = async (subject : string, body : string) : Promise<void> => {
    await transporter.sendMail({
        from    : config.smtp_user,
        to      : config.alert_to,
        subject : subject,
        text    : body,
    });
}





////////////////////////////////////////////////////////////////////////////////
//
// TODO.
//

send_alert(
    'TEST ALERT: Device 01',
    'Test message from the capstone app.',
).catch(
    error => console.error('Send failed:', error)
);
