import axios from "axios";
import { googleCredential } from "../config";

export const getNewUrl = async () => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?
   client_id=${googleCredential.web.client_id}&
   redirect_uri=${googleCredential.web.redirect_uris[0]}&
   access_type=offline&
   response_type=code&
   scope=https://www.googleapis.com/auth/spreadsheets&
   state=new_access_token&
   include_granted_scopes=true&
   prompt=consent
   `;
  return await axios.get(url);
};

export const getNewRefreshToken = async (code: any) => {
  let data = {
    client_id: googleCredential.web.client_id,
    client_secret: googleCredential.web.client_secret,
    code,
    grant_type: "authorization_code",
    redirect_uri: googleCredential.web.redirect_uris[0],
  };
  const axiosCOnfig = {
    method: "post",
    url: "https://oauth2.googleapis.com/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    params: data,
  };
  return await axios(axiosCOnfig);
};

export const getAccessTOken = async(refreshToken: any) => {
  const params = {
    client_id: googleCredential.web.client_id,
    client_secret: googleCredential.web.client_secret,
    refresh_token: refreshToken,
    grant_type:"refresh_token"
  };
  const axiosCOnfig = {
    method: "post",
    url: "https://oauth2.googleapis.com/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    params: params,
  };
  return await axios(axiosCOnfig);
};
