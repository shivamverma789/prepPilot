const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmail = async (to, subject, html) => {
    try {
        const response = await tranEmailApi.sendTransacEmail({
            sender: {
                email: "shivamjitendraverma@gmail.com", // ⚠️ use your Brevo verified email
                name: "PrepPilot"
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        });

        console.log("Email sent:", response.messageId);
        return true;

    } catch (err) {
        console.error("Brevo Email Error:", err.response?.body || err.message);
        return false;
    }
};