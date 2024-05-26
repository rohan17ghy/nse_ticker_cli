import { start } from "repl";
import { fyers, getAccessToken } from "../fyers";
import { getNearestOptionStrikes } from "../marketInfo";
import { time } from "console";
import { getMarketCloseTime, getMarketOpenTime, getPreviousDayCloseTime, convertToEpoch } from "../utils";

export async function getTodaysFirstCandleInfo(symbols: any[]): Promise<any> {
    fyers.setAccessToken(getAccessToken());
   
    const dateTime = new Date();
    dateTime.setHours(9, 15, 0, 0);

    //getNearestOptionStrikes(symbols[0]);

    const inps = symbols.map(symbol => ({
        "symbol": symbol.name,
        "resolution":"1",
        "date_format":"0",
        "range_from": convertToEpoch(dateTime),
        "range_to": convertToEpoch(dateTime),
        "cont_flag":"1"
    }));
    
    inps.forEach(async inp => {
        await fyers.getHistory(inp).then((response: any)=>{
            console.log(`First candle date: ${JSON.stringify(response)}`);
        }).catch((err: any)=>{
            console.log(`Error: ${JSON.stringify(err)}`);
        })
    });

}


//Getting the past `numberOfPrevCandles` candles of `interval` interval for the symbol `symbol`  
export async function getHistoryCandles(symbol: any, interval: number, numberOfPrevCandles: number){   

    try{
        fyers.setAccessToken(getAccessToken());
        let now = new Date();
        const marketCloseTime = getMarketCloseTime();

        if(now > marketCloseTime){
            now = marketCloseTime;
        }

        if(now < getMarketOpenTime()){
            now = getPreviousDayCloseTime();
        }
        
        const endTime = convertToEpoch(now);//1714713300;//now.getTime() - 50000; //1714622400;
        const startTimeStamp = convertToEpoch(new Date(now.getTime() - interval * numberOfPrevCandles * 60 * 1000));//1714708800;//now.getTime() - interval * numberOfPrevCandles * 60 * 1000; //1714621800;
        const startTime = startTimeStamp;
        
        
        //console.log(`symbol: ${symbol}, interval: ${interval}, startTime: ${startTime}, endTime: ${endTime} startTimeType: ${typeof(startTime)} EndTimeType: ${typeof(endTime)}`);
        const inp = {
            "symbol": symbol,
            "resolution":interval,
            "date_format":"0",
            "range_from": startTime,
            "range_to": endTime,
            "cont_flag":"1"
        }
        //console.log(`Inp: ${JSON.stringify(inp)}`);

        const candles = await fyers.getHistory(inp);
        //console.log(`History candles: ${JSON.stringify(candles)}`);

        return candles;
    }catch(err){
        console.log(`Error: ${JSON.stringify(err)}`);
    }
}

//interval in minutes
export async function getSingleCandle(symbol: any, interval: number, dateTime: Date){

    //Need to find a way where we don't need to authenticate it for every request
    fyers.setAccessToken(getAccessToken());

    const startTimeEpoch = convertToEpoch(dateTime);
    // const endTime = new Date(dateTime);

    // let endMinutes = endTime.getMinutes() + interval;
    // if(endMinutes >= 60){
    //     endTime.setHours(endTime.getHours() + 1);
    //     endMinutes %= 60;
    // }

    // endTime.setMinutes(endMinutes);
    // const endTimeEpoch = convertToEpoch(endTime);

    const inp = {
        "symbol": symbol,
        "resolution": interval,
        "date_format":"0",
        "range_from": startTimeEpoch,
        "range_to": startTimeEpoch,
        "cont_flag":"1"
    }

    console.log(`Input: ${JSON.stringify(inp)}`);

    const candles = await fyers.getHistory(inp);
    console.log(`Candles: ${JSON.stringify(candles)}`);
    return candles;
}