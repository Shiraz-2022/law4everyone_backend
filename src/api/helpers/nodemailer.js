const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const process = require("process");
const dotenv = require("dotenv");
const { HTTP_STATUS_CODES } = require("./statusCodes");

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENTID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URL
);

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

const sendMail = async (next, email, verificationLink) => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_MAILID,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_MAILID,
    to: email,
    subject: "Verify your email",
    text: `Click the following link to verify your email: ${verificationLink}`,
  });

  return;
};

module.exports = sendMail;
