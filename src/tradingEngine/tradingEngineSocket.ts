import WebSocket from "ws";
import { AggrMessageType } from "../sockets/aggrCandleManager";
import { Candle } from "../technicals/candlesticks";
import { LTPSocket } from "../sockets/ltpSocket";

export class TradingEngineSocket{
    private static _instance: TradingEngineSocket;
    private candlesWS: WebSocket;
    private ltpWS: LTPSocket;
    private symbolsData: { symbol: string, candles: Candle[] }[];
    private pendingSubscriptions: AggrMessageType[];

    private constructor() {
        this.candlesWS = new WebSocket("ws://localhost:8088/");
        this.ltpWS = LTPSocket.getInstance();
        this.symbolsData = [];
        this.pendingSubscriptions = [];
        this.init();
    }

    static getInstance(){
        if(!TradingEngineSocket._instance){
            TradingEngineSocket._instance = new TradingEngineSocket();
        }

        return TradingEngineSocket._instance;
    }

    init(){
        const candleWS = this.candlesWS;
        candleWS.on('open', () => {
            console.log('Connected to the Candles WebSocket server');
        
            // Listen for messages from the server
            candleWS.on('message', this.onCandlesData);
            this.processPendingSubscriptions();
        });
        
        candleWS.on('close', () => {
            console.log('Disconnected from the WebSocket server');
        });

        const ltpSocket = this.ltpWS;
        ltpSocket.addMessageHandler(this.onLTPData);
    }

    
    subscribeToSymbol(aggrInp: AggrMessageType){
        this.ltpWS.subscribeToSymbol(aggrInp.symbol);
        if (this.candlesWS.readyState === WebSocket.OPEN) {
            this.candlesWS.send(JSON.stringify(aggrInp));
        } else {
            this.pendingSubscriptions.push(aggrInp);
        }
    }

    unsubscribeFromSymbol(aggrInp: AggrMessageType){
        //this.ltpWS.unsubscribeFromSymbol(aggrInp.symbol);
        if (this.candlesWS.readyState === WebSocket.OPEN) {
            this.candlesWS.send(JSON.stringify(aggrInp));
        } else {
            // You might want to handle pending unsubscriptions similarly
            this.pendingSubscriptions = this.pendingSubscriptions.filter(sub => sub.symbol !== aggrInp.symbol);
        }
    }
    

    private onCandlesData = (bufferedData: Buffer) => {
        const data: Candle | Candle[] = JSON.parse(bufferedData.toString());
        //console.log(`Received from AggrSocket: ${JSON.stringify(data)}`);
        if(data instanceof Array){
            const candles = data;
            if(data.length > 0){
                this.symbolsData.push({ symbol: candles[0].symbol, candles });
            }
        }
        else{
            const candle = data;
            const subscribedSymbol = this.symbolsData.find(x => x.symbol === candle.symbol);
            if(subscribedSymbol){
                const candleIndex = subscribedSymbol.candles.findIndex(x => x.time === candle.time);
                if(candleIndex !== -1){
                    subscribedSymbol.candles[candleIndex] = candle;
                }
                else{
                    subscribedSymbol.candles.push(candle);
                }
                
            }
        }
        this.logSubscribedData();
    }
    
    private onLTPData = (message: any): void => {
        console.log(`Received from LTPSocket: ${JSON.stringify(message)}`);
        console.log(`LTP from ${message.symbol} : ${JSON.stringify(message.ltp)}`);
    }

    private processPendingSubscriptions() {
        while (this.pendingSubscriptions.length > 0) {
            const aggrInp = this.pendingSubscriptions.shift();
            if (aggrInp) {
                this.candlesWS.send(JSON.stringify(aggrInp));
            }
        }
    }

    private logSubscribedData(){
        
        for(const symbol of this.symbolsData){
            const n = symbol.candles.length;
            console.log(`Data from trading_engine socket: ${JSON.stringify(symbol.candles.slice(n-5, n))}`);
        }
        
    }
}