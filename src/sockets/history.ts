import { start } from "repl";
import { fyers, getAccessToken } from "../fyers";
import { getNearestOptionStrikes } from "../marketInfo";
import { time } from "console";
import { getMarketCloseTime, getMarketOpenTime, getPreviousDayCloseTime } from "../utils";

export async function getFirstCandleInfo(symbols: any[]): Promise<any> {
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



function convertToEpoch(dateTime: Date): Number{
    console.log(`DateTime: ${dateTime}`);
    return Math.floor(dateTime.getTime() / 1000);
}