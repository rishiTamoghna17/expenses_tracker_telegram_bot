export const BOT_TOKEN =
  process.env.BOT_TOKEN || "6731596487:AAEeJ-4ns15KTl-fh6dj-U9JFfP7vQluyOE";

export const googleCredential = {
  web: {
    client_id:
      "324955902254-5816vjoefs9a913ncrco32q3rgli2q0r.apps.googleusercontent.com",
    project_id: "telegram-bot-416915",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "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",
    redirect_uris: ["http://localhost:3000/gtoken"],
  },
};
