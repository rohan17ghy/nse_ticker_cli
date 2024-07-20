import { start } from "repl";
import { fyers, getAccessToken } from "../fyers";
import { getNearestOptionStrikes } from "../marketInfo";
import { time } from "console";
import { getMarketCloseTime, getMarketOpenTime, getPreviousDayCloseTime, convertToEpoch, MinuteEventEmitter } from "../utils";
import { APIOptionChainData, getCEStrikes, getPEStrikes, aggregateOptionsData as aggregateOptionsData } from "../options/options";
import { getBNStrikes } from "../api/api";
import { createCandle } from "./candlesticks";

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

const minuteEmitter = new MinuteEventEmitter();

export async function get1minCandles(ceStart: string, ceEnd: string,  peStart: string, peEnd: string){ 
    try{
        fyers.setAccessToken(getAccessToken());
        const ceStrikes = getCEStrikes(ceStart, ceEnd);
        const peStrikes = getPEStrikes(peStart, peEnd);
        minuteEmitter.on('minuteEvent', async (now: Date) => {
            try{
                console.log('Minute event triggered at', now.toLocaleTimeString());
            
                const nineFifteenAM = new Date();
                nineFifteenAM.setHours(9, 15, 0, 0);
                                                
                now.setMinutes(now.getMinutes() - 1);

                console.log(`nineFifteenAMEpoch: ${convertToEpoch(nineFifteenAM)}, nowEpoch: ${convertToEpoch(now)}`);
                
                const ceApiOptionsChain: APIOptionChainData[] = await Promise.all(ceStrikes.map(async (strike) => {
                    console.log(`ceStrike: ${strike}`);

                    const inp = {
                        "symbol": strike,
                        "resolution":"1",
                        "date_format":"0",
                        "range_from": convertToEpoch(nineFifteenAM),
                        "range_to": convertToEpoch(now),
                        "cont_flag":"1"
                    }

                    const candles = await fyers.getHistory(inp);
                    return {
                        symbol: strike,
                        data: candles?.candles.map((candleApiData: [number, number, number, number, number, number]) => createCandle(candleApiData, '1min'))
                    }
                }));

                const peApiOptionsChain: APIOptionChainData[] = await Promise.all(peStrikes.map(async (strike) => {
                    console.log(`peStrike: ${strike}`);

                    const inp = {
                        "symbol": strike,
                        "resolution":"1",
                        "date_format":"0",
                        "range_from": convertToEpoch(nineFifteenAM),
                        "range_to": convertToEpoch(now),
                        "cont_flag":"1"
                    }

                    const candles = await fyers.getHistory(inp);
                    return {
                        symbol: strike,
                        data: candles?.candles.map((candleApiData: [number, number, number, number, number, number]) => createCandle(candleApiData, '1min'))
                    }
                }));

                const ceOptionsChain = aggregateOptionsData(ceApiOptionsChain);
                const peOptionsChain = aggregateOptionsData(peApiOptionsChain);
                
                console.log(`ceCandles: ${JSON.stringify(ceOptionsChain)}, peCandles: ${JSON.stringify(peOptionsChain)}`);
                
            }catch(err){
                console.log(`Error while getting 1min candles in event handler: ${JSON.stringify(err)}`);
            }
            
        });
    }catch(err){
        console.log(`Error while getting 1min candles: ${JSON.stringify(err)}`);
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