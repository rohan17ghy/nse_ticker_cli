import { getAccessToken } from "../fyers";
import { FyersSocket } from "../fyers";
import { getNextInterval } from "../utils"; 
import { getHistoryCandles } from "./history";
import { logSymbol } from '../utils/logger';

var fyersDataSocket: any = null;
var lastHistoryFetchTimestamp: Date = new Date(0); // Represents DateTime.MinValue
var historyCandles: any | undefined;
var nextInterval: Date = new Date(0);

export function getMarketData(symbol: any, interval: number, numberOfPrevCandles: number) {
    
    if(!fyersDataSocket){
        fyersDataSocket = new FyersSocket(getAccessToken());
    }    

    fyersDataSocket.on("message", async (message: any) => {
        const now = new Date();
        //console.log(`Now: ${now}`);
        if(!historyCandles || now >= nextInterval){
            lastHistoryFetchTimestamp = now;
            nextInterval = getNextInterval(interval);
            //console.log(`inside the if statement`);
            //console.log(`LastHistotyFetchTime: ${lastHistoryFetchTimestamp}`);
            historyCandles = await getHistoryCandles(symbol, interval, numberOfPrevCandles);

            //console.log(`*************************************History candles: ${JSON.stringify(historyCandles)}*************************************`);
        }
        console.clear();
        console.log(`Next Interval: ${nextInterval}`);
        console.log(`Recieved message from server: ${JSON.stringify(message)}`);
        console.log(`History candles: ${JSON.stringify(historyCandles)}`);
        logSymbol(historyCandles);
    })
    fyersDataSocket.on("connect", () => {
        console.log('On Connect from server...');
        fyersDataSocket.subscribe([symbol]) //not subscribing for market depth data
        // fyersdata.mode(fyersdata.LiteMode) //set data mode to lite mode
        // fyersdata.mode(fyersdata.FullMode) //set data mode to full mode is on full mode by default
        fyersDataSocket.autoreconnect(6) //enable auto reconnection mechanism in case of disconnection
    })
    fyersDataSocket.on("error", (err: any) => {
        console.log(`Error on socket: ${JSON.stringify(err)}`)
    })

    fyersDataSocket.on("close", () => {
        console.log("socket closed")
    })

    fyersDataSocket.connect()
    
}