import { getAccessToken } from "../fyers";
import { FyersSocket } from "../fyers";
import { getNextInterval } from "../utils"; 
import { getHistoryCandles } from "../technicals/history";
import { logSymbol } from '../utils/logger';
import { getRunningCandleColor } from '../technicals/candlesticks';

//var fyersDataSocket: any = null;
var lastHistoryFetchTimestamp: Date = new Date(0); // Represents DateTime.MinValue
var historyCandles: any | undefined;
var nextInterval: Date = new Date(0);

type MessageHandlerType = (message: any) => Promise<void>;

class MarketDataSocket {
    private static _instance: MarketDataSocket;
    public fyersDataSocket: typeof FyersSocket;

    constructor() {
        if (!MarketDataSocket._instance){
            MarketDataSocket._instance = this
            this.fyersDataSocket = new FyersSocket(getAccessToken());

            this.fyersDataSocket.on("error", (err: any) => {
                console.log(`Error on socket: ${JSON.stringify(err)}`)
            });
        
            this.fyersDataSocket.on("close", () => {
                console.log("socket closed")
            });
        }

        return MarketDataSocket._instance
    }
    
    static getInstance() {
        if (!MarketDataSocket._instance) {
            MarketDataSocket._instance = new MarketDataSocket();
        }
        return MarketDataSocket._instance;
    }

    subscribeToSymbol(symbol: any){
        this.fyersDataSocket.on("connect", () => {
            console.log('On Connect from server...');
            this.fyersDataSocket.subscribe([symbol]) //not subscribing for market depth data
            // fyersdata.mode(fyersdata.LiteMode) //set data mode to lite mode
            // fyersdata.mode(fyersdata.FullMode) //set data mode to full mode is on full mode by default
            this.fyersDataSocket.autoreconnect(6) //enable auto reconnection mechanism in case of disconnection
        });
    }

    addMessageHandler(messageHandler: MessageHandlerType) {
        this.fyersDataSocket.on("message", messageHandler);
    }

    connect() {
        this.fyersDataSocket.connect();
    }
    
}

export function getMarketData(symbol: any, interval: number, numberOfPrevCandles: number) {    
    const fyersDataSocket = MarketDataSocket.getInstance().fyersDataSocket;

    // if(!fyersDataSocket){
    //     fyersDataSocket = new FyersSocket(getAccessToken());
    // }

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
        //console.log(`Recieved message from server: ${JSON.stringify(message)}`);
        console.log(`${message.symbol} LTP: ${message.ltp} Color: ${getRunningCandleColor(message.open_price, message.high_price, message.low_price, message.ltp)} High: ${message.high_price} Low: ${message.low_price}`);
        //console.log(`History candles: ${JSON.stringify(historyCandles)}`);
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