import { openInIncognito } from '../utils/url-helper';
const fyersAPI = require('fyers-api-v3');
const FyersSocket = require("fyers-api-v3").fyersDataSocket
const FyersOrderSocket = require("fyers-api-v3").fyersOrderSocket

const fyers = new fyersAPI.fyersModel();

export function authenticateUser(){
    // Set your APPID obtained from Fyers API dashboard
    // Set the RedirectURL where the authorization code will be sent after the user grants access
    // Make sure your redirectURL matches with your server URL and port
    fyers.setAppId(process.env.CLIENT_ID);
    fyers.setRedirectUrl(process.env.REDIRECT_URL);

    console.log("AppID and RedirectURL set completed");

    // Generate the URL to initiate the OAuth2 authentication process and get the authorization code URL
    var authCodeURL = fyers.generateAuthCode();
    console.log(`AuthCode URL: ${authCodeURL}`);

    openInIncognito(authCodeURL);
}

export { fyers, FyersSocket, FyersOrderSocket }
export { setAuthCode, getAuthCode, setAccessToken, getAccessToken } from './auth';
