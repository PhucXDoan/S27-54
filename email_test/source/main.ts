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

// For local Zammad stuff, here's my procedure:
//
// 1. Install Docker; this can be done with `winget install Docker.DockerDesktop`.
//
// 2. Start the Docker Desktop application (GUI).
//
// 3. Get the Zammad Docker stuff: `git clone https://github.com/zammad/zammad-docker-compose.git`
//    Please do it outside of this S27-54 repository...
//
// 4. In `zammad-docker-compose`, run `docker compose up -d`.
//    This will take a while.
//
// 5. After it's done, go to `http://localhost:8080/`.
//    - Do `Set up a new system`.
//    - Only the email and password are required, but they can be whatever.
//    - Fill whatever out for the organization name.
//    - Skip the email notification section.
//    - Skip the "Connect Channels" section.
//
// 6. Go to the bottom-left user icon and click to go to "Profile".
//    Go to "Token Access" and create a personal access token.
//    Give the token a name and, for simplicity, check every box that it'll allow you to check.
//    Copy and save the token secret to `.env`.
//
// 7. The local `.env` file should have these variables:
//    ```
//        ZAMMAD_URL=http://localhost:8080
//        ZAMMAD_TOKEN=<TOKEN_YOU_COPY_AND_PASTED_HERE>
//        ZAMMAD_GROUP=Users
//        ZAMMAD_CUSTOMER=<THE_EMAIL_ADDRESS_YOU_GAVE>
//    ```
//
// 8. Do `npm run start` and it should successfully create a ticket and show up on the "Overviews".

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
    smtp_host       :        get_from_process_env('SMTP_HOST'      ),
    smtp_port       : Number(get_from_process_env('SMTP_PORT'      )),
    smtp_user       :        get_from_process_env('SMTP_USER'      ),
    smtp_pass       :        get_from_process_env('SMTP_PASS'      ),
    alert_to        :        get_from_process_env('ALERT_TO'       ),
    zammad_url      :        get_from_process_env('ZAMMAD_URL'     ),
    zammad_token    :        get_from_process_env('ZAMMAD_TOKEN'   ),
    zammad_group    :        get_from_process_env('ZAMMAD_GROUP'   ),
    zammad_customer :        get_from_process_env('ZAMMAD_CUSTOMER'),
    threshold       : 100,
    cooldown_ms     : 5 * 60 * 1000,
};



const Device_Payload_Schema = zod.z.object({
    device_id           : zod.z.string(),
    a_very_useful_value : zod.z.number(),
});

type Device_Payload = zod.z.infer<typeof Device_Payload_Schema>;



const Zammad_Ticket_Response_Schema = zod.z.object({
    id     : zod.z.number(),
    number : zod.z.string(), // Because `0042` is distinct from `42`, or whatever.
});

type Zammad_Ticket_Response = zod.z.infer<typeof Zammad_Ticket_Response_Schema>;





////////////////////////////////////////////////////////////////////////////////
//
// Stuff for alerting.
//

const email_transporter = nodemailer.createTransport({
    host   : configuration.smtp_host,
    port   : configuration.smtp_port,
    secure : configuration.smtp_port === 465,
    auth   : {
        user : configuration.smtp_user,
        pass : configuration.smtp_pass,
    },
});

const send_alert_via_email = async (subject : string, body : string) : Promise<void> => {
    await email_transporter.sendMail({
        from    : configuration.smtp_user,
        to      : configuration.alert_to,
        subject : subject,
        text    : body,
    });
}

const send_alert_via_zammad = async (subject : string, body : string) : Promise<Zammad_Ticket_Response> => {

    const post_result = await fetch(
        `${configuration.zammad_url}/api/v1/tickets`,
        {
            method  : 'POST',
            headers : {
                'Authorization' : `Token token=${configuration.zammad_token}`,
                'Content-Type'  : 'application/json',
            },
            body : JSON.stringify({
                title    : subject,
                group    : configuration.zammad_group,
                customer : configuration.zammad_customer,
                article  : {
                    subject  : subject,
                    body     : body,
                    type     : 'note',
                    internal : false,
                },
            }),
            signal : AbortSignal.timeout(5000),
        }
    );

    if (!post_result.ok) {
        throw new Error(`Zammad responded ${post_result.status} : ${await post_result.text()}`);
    }

    const zammad_ticket_response = Zammad_Ticket_Response_Schema.parse(await post_result.json());

    return zammad_ticket_response;

};





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

    const email_alert_error = await send_alert_via_email(
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

switch (Number(1)) {

    case 0: {

        app.listen(3000, () => console.log('Listening on port 3000'));

    } break;

    case 1: {


        (async () => {

            const ticket = await send_alert_via_zammad(
                '[TEST???!!] Capstone alert',
                'Manual TypeScript test',
            );

            console.log(ticket);

        })();

    } break;

}
