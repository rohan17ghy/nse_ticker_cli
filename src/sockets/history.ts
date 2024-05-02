import { start } from "repl";
import { fyers, getAccessToken } from "../fyers";
import { getNearestOptionStrikes } from "../marketInfo";
import { time } from "console";

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
        const now = new Date(/*new Date().getTime() - 80000*/);
        const endTime = 1714622400 //now.getTime();
        const startTimeStamp = 1714621800//now.getTime() - interval * numberOfPrevCandles * 60 * 1000;
        const startTime = startTimeStamp;
        
        console.log(`symbol: ${symbol}, interval: ${interval}, startTime: ${startTime}, endTime: ${endTime} interval: ${interval} intervalType: ${typeof(interval)} numberOfPrevCandles: ${numberOfPrevCandles} prevCandlesType: ${typeof(numberOfPrevCandles)}`);
        const inp = {
            "symbol": symbol,
            "resolution":interval,
            "date_format":"0",
            "range_from": startTime,
            "range_to": endTime,
            "cont_flag":"1"
        }
        console.log(`Inp: ${JSON.stringify(inp)}`);

        const candles = await fyers.getHistory(inp);
        console.log(`History candles: ${JSON.stringify(candles)}`);

        return candles;
    }catch(err){
        console.log(`Error: ${JSON.stringify(err)}`);
    }
}



function convertToEpoch(dateTime: Date): Number{
    console.log(`DateTime: ${dateTime}`);
    return Math.floor(dateTime.getTime() / 1000);
}