import express from 'express';
import 'dotenv-flow/config';
import loginRoutes from './routes/login';
import cors from 'cors';
import { openInIncognito } from './utils/url-helper';


const main = async () => {
    
    try{
        
        const fyersAPI = require('fyers-api-v3');
        var fyers = new fyersAPI.fyersModel();

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

    }catch(err){
        console.log("Error: ", err);
    }


    const app = express();
    const port = 19232;

    app.use(cors());
    app.use('/login', loginRoutes);

    app.listen(port, () => {
        console.log(`The server running at port ${port}`);
    })
}

main()
.catch((err) => {
    console.log(`Error in main method: ${err}`);
})

