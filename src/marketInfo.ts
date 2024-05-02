import { fyers, getAccessToken } from "./fyers";
import axios from "axios";

export const getNearestOptionStrikes = async (symbol: string) => {
    
    const currentPrice = await getCurrentPrice(symbol);

    console.log(`CurrentPrice: ${JSON.stringify(currentPrice)}`);
    console.log(`Auth Token: ${getAccessToken()}`);

    fyers.setAccessToken(getAccessToken());

    const FyersAPI = require("fyers-api-v3").fyersModel

    var fyers1 = new FyersAPI()
    fyers1.setAppId(process.env.CLIENT_ID)
    fyers1.setRedirectUrl(process.env.REDIRECT_URL)
    fyers1.setAccessToken(getAccessToken())

    var inp={
    "symbol":["NSE:SBIN-EQ","NSE:TCS-EQ"],
    "ohlcv_flag":1
    }

    console.log('Invoking getoption chain');

    fyers.getOptionChain({"symbol":"NSE:SBIN-EQ","strikecount":1,"timestamp": ""}).then((response: any)=>{
        console.log(response.data)
    }).catch((err: any)=>{
        console.log(err)
    })


    // fyers.getOptionChain({"symbol":"NSE:SBIN-EQ","strikecount":1,"timestamp": ""}).then((response: any)=>{
    //     console.log(response.data)
    // }).catch((err: any)=>{
    //     console.log(err)
    // })

    // const response = await axios.get(`https://api-t1.fyers.in/indus/data/v1/options-chain?symbol=${symbol}`, {
    //     headers: {
    //         authorization: `${getAccessToken()}`
    //     }
    // });

    // console.log(response);

    // return response.data.data;
}

export const getCurrentPrice = async (symbol: string) => {

    fyers.setAccessToken(getAccessToken());

    const response = await fyers.getQuotes([symbol]);
    return response;
}