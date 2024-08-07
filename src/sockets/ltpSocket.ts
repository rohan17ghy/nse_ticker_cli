import { getAccessToken } from "../fyers";
import { FyersSocket } from "../fyers";
import { getNextInterval } from "../utils"; 
import { getHistoryCandles } from "../technicals/history";
import { logSymbol } from '../utils/logger';
import { getRunningCandleColor } from '../technicals/candlesticks';
import { WebSocket } from "ws";

//var fyersDataSocket: any = null;
var lastHistoryFetchTimestamp: Date = new Date(0); // Represents DateTime.MinValue
var historyCandles: any | undefined;
var nextInterval: Date = new Date(0);

export class LTPSocket {
    private static _instance: LTPSocket;
    private fyersLTPSocket: typeof FyersSocket;
    private pendingSubscriptions: string[];

    private constructor() {
        this.fyersLTPSocket = new FyersSocket(getAccessToken());
        this.pendingSubscriptions = [];
        this.init();
    }

    init(){
        this.fyersLTPSocket.on("connect", () => {
            console.log('Connected to fyers ltp socket.');

            this.processPendingSubscriptions();
        });
        this.fyersLTPSocket.on("error", (err: any) => {
            console.error(`Error on socket: ${JSON.stringify(err)}`)
        });
        this.fyersLTPSocket.on("close", () => {
            console.log("socket closed")
        });
        this.connect();
    }
    
    static getInstance() {
        if (!LTPSocket._instance) {
            LTPSocket._instance = new LTPSocket();
        }
        return LTPSocket._instance;
    }

    private processPendingSubscriptions() {
        while (this.pendingSubscriptions.length > 0) {
            const symbol = this.pendingSubscriptions.shift();
            if (symbol) {
                this.fyersLTPSocket.subscribe([symbol]);
                console.log(`subscribed to ltp for symbol ${symbol}`);
            }
        }
    }

    subscribeToSymbol(symbol: string){
        if(this.fyersLTPSocket.readyState === WebSocket.OPEN){
            this.fyersLTPSocket.subscribe([symbol]);
            console.log(`subscribed to ltp for symbol ${symbol}`);
            this.fyersLTPSocket.autoreconnect(6);
        } else {
            this.pendingSubscriptions.push(symbol);
        }
    }

    unsubscribeFromSymbol(symbol: string){
        this.fyersLTPSocket.unsubscribe([symbol]);

        if (this.fyersLTPSocket.readyState === WebSocket.OPEN) {
            this.fyersLTPSocket.unsubscribe([symbol]);
        } else {
            // You might want to handle pending unsubscriptions similarly
            this.pendingSubscriptions = this.pendingSubscriptions.filter(sym => sym !== symbol);
        }
    }

    addMessageHandler(messageHandler: (message: any) => Promise<void> | void) {
        this.fyersLTPSocket.on("message", messageHandler);
    }

    connect() {
        this.fyersLTPSocket.connect();
    }
    
}

export function getMarketData(symbol: any, interval: number, numberOfPrevCandles: number) {    
    const fyersDataSocket = LTPSocket.getInstance();
    fyersDataSocket.addMessageHandler(async (message: any) => {
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
    });
    fyersDataSocket.connect();
    
}