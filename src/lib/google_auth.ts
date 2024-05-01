import axios from 'axios';
import { client_id, client_secret, googleCredential, redirect_uris } from '../config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
export const getNewUrl = async () => {
  try {
    // const scopes = [
    //   'https://www.googleapis.com/auth/spreadsheets',
    // ];
    // const url = `https://accounts.google.com/o/oauth2/v2/auth?
    // client_id=${googleCredential.web.client_id}&
    // redirect_uri=${googleCredential.web.redirect_uris[0]}&
    // access_type=offline&
    // response_type=code&
    // scope=${scopes.join(' ')}&
    // state=new_access_token&
    // include_granted_scopes=true&
    // prompt=consent
    // `;
    // return await axios.get(url);

    const options = {
      redirect_uri: googleCredential.web.redirect_uris[0],
      client_id: googleCredential.web.client_id,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/spreadsheets',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${qs.toString()}`;
    return url;
  } catch (e) {
    console.log('error in getNewUrl', e);
  }
};

export const getNewRefreshToken = async (code: any) => {
  let data = {
    client_id: googleCredential.web.client_id,
    client_secret: googleCredential.web.client_secret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: googleCredential.web.redirect_uris[0],
  };
  const axiosCOnfig = {
    method: 'post',
    url: 'https://oauth2.googleapis.com/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    params: data,
  };
  return await axios(axiosCOnfig);
};

export const getAccessTOken = async (refreshToken: any) => {
  try {
    const params = {
      client_id: googleCredential.web.client_id,
      client_secret: googleCredential.web.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };
    const axiosCOnfig = {
      method: 'post',
      url: 'https://oauth2.googleapis.com/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      params: params,
    };
    const data = await axios(axiosCOnfig);
    return data.data.access_token;
  } catch (err) {
    console.log('err in getAccessTOken', err);
  }
};

export const getGoogleAuth = (accessToken: string) => {
  try {
    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });
    return client;
  } catch (err) {
    console.log('err in getGoogleAuth', err);
  }
};
type UserType = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};
export async function getUserDetail(data: {
  access_token: string;
  id_token: string;
}): Promise<UserType> {
  try {
    const { access_token, id_token } = data;
    const response = await axios.get<UserType>(
      `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      },
    );
    console.log('response---------->>>>>>', response.data);

    return response.data;
  } catch (error) {
    console.log('error in getUserEmail', error);
    throw new Error('Failed to fetch user detail');
  }
}
