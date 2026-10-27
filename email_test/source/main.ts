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

import nodemailer from 'nodemailer';
import express    from 'express';
import * as zod   from 'zod';





////////////////////////////////////////////////////////////////////////////////
//
// Top-level definitions.
//

const get_from_process_env = (name : string) : string => {

    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;

}

const configuration = {
    smtp_host   :        get_from_process_env('SMTP_HOST'),
    smtp_port   : Number(get_from_process_env('SMTP_PORT')),
    smtp_user   :        get_from_process_env('SMTP_USER'),
    smtp_pass   :        get_from_process_env('SMTP_PASS'),
    alert_to    :        get_from_process_env('ALERT_TO' ),
    threshold   : 100,
    cooldown_ms : 5 * 60 * 1000,
};

const Device_Payload_Schema = zod.z.object({
    device_id           : zod.z.string(),
    a_very_useful_value : zod.z.number(),
});

type Device_Payload = zod.z.infer<typeof Device_Payload_Schema>;





////////////////////////////////////////////////////////////////////////////////
//
// Stuff for emailing.
//

const transporter = nodemailer.createTransport({
    host   : configuration.smtp_host,
    port   : configuration.smtp_port,
    secure : configuration.smtp_port === 465,
    auth   : {
        user : configuration.smtp_user,
        pass : configuration.smtp_pass,
    },
});

const send_alert = async (subject : string, body : string) : Promise<void> => {
    await transporter.sendMail({
        from    : configuration.smtp_user,
        to      : configuration.alert_to,
        subject : subject,
        text    : body,
    });
}





////////////////////////////////////////////////////////////////////////////////
//
// Stuff for the server.
//

const app = express();
app.use(express.json());

app.post('/device_payload', async (request, result) => {

    console.log('Got', request.body);



    // Parse the received data.

    const device_payload = Device_Payload_Schema.safeParse(request.body);

    if (!device_payload.success) {
        result
            .status(400)
            .json({ error : 'failed to parse body' });
        return;
    }



    // Send the alert.

    const email_alert_error = await send_alert(
        'S27-54 Alert Test',
        `Device payload: ${JSON.stringify(device_payload.data, null, 4)}`,
    ).then(
        ()    => null,
        error => error,
    );

    if (email_alert_error) {

        result
            .status(500)
            .json({ status : 'emailing failed' });
        return;

    }



    result.json({ status : 'email sent' });
    return;

});





////////////////////////////////////////////////////////////////////////////////
//
// TODO.
//

app.listen(3000, () => console.log('Listening on port 3000'));
