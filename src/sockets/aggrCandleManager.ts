import WebSocket, { WebSocketServer } from "ws";
import { MinuteEventEmitter } from "../utils";
import { get1minAggrCandles } from "../technicals/history";

type WSMessageType = {
    type: "SUBSCRIBE" | "UNSUBSCRIBE",
    symbol: string
} | AggrMessageType;


export type AggrMessageType = {
    type: "SUBSCRIBE_AGGR_OPTIONS" | "UNSUBSCRIBE_AGGR_OPTIONS",
    symbol: string,
    start: string, 
    end: string, 
    optionType: "CE" | "PE"
};



export class AggrCandleManager {
    private port: number;
    private wss: WebSocketServer;
    private static serverInstance: AggrCandleManager;
    private symbols: string[];
    private subscribedAggrOptions: { lastTime: number, aggrInp: AggrMessageType }[];

    private constructor() {
        this.port = 8088    
        this.wss = new WebSocketServer({ port : this.port });
        this.symbols = [];
        this.subscribedAggrOptions = [];
        this.init();
    }

    init(){
        this.wss.on('connection', (ws: WebSocket) => {
            console.log(`New client connected`);

            ws.on('message', async (bufferedData: Buffer) => {
                const data: WSMessageType = JSON.parse(bufferedData.toString());
                if(data.type === "SUBSCRIBE"){
                    this.symbols.push(data.symbol);
                }
                else if(data.type === "UNSUBSCRIBE"){
                    const index = this.symbols.indexOf(data.symbol);
                    if(index !== -1){
                        this.symbols.splice(index, 1);
                    }
                }
                else if(data.type == "SUBSCRIBE_AGGR_OPTIONS"){
                    const { type, ...aggrInp } = data;
                    //Immediately send the history candles
                    const initialCandles = await get1minAggrCandles(data);
                    //console.log(`Initial candles: ${JSON.stringify(initialCandles)}`);
                    if(initialCandles){
                        const N = initialCandles.length;
                        const lastClosedCandleTime = initialCandles[N - 2].time;
                        //Not sending the current running candle
                        initialCandles.splice(N - 1, 1);

                        ws.send(JSON.stringify(initialCandles));
                        this.subscribedAggrOptions?.push({ lastTime: lastClosedCandleTime, aggrInp: data });
                    }
                    

                    const minuteEmitter = new MinuteEventEmitter(1);
                    minuteEmitter.on("minuteEvent", async (date) => {
                        for(const sub of this.subscribedAggrOptions){
                            const candles = await get1minAggrCandles(sub.aggrInp);
                            if(candles){
                                const lastClosedCandle = candles[candles.length - 2];
                                sub.lastTime = lastClosedCandle.time;
                                console.log(`Date: ${date},  Candle: ${JSON.stringify(lastClosedCandle)}`);
                                ws.send(JSON.stringify(lastClosedCandle));
                            }
                        }
                        
                    });

                    console.log(`Subscribed to aggr options: ${JSON.stringify(aggrInp)}`);
                }
                else if(data.type == "UNSUBSCRIBE_AGGR_OPTIONS"){
                    const index = this.subscribedAggrOptions?.findIndex((obj) =>
                        obj.aggrInp.start === data.start &&
                        obj.aggrInp.end === data.end && 
                        obj.aggrInp.optionType === data.optionType &&
                        obj.aggrInp.symbol === data.symbol
                    );
                    if(index !== -1){
                        this.subscribedAggrOptions?.splice(index, 1);
                    }
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

        });

        console.log(`WebSocket server is running on ws://localhost:${this.port}`);
    }

    static getInstance(){
        if(!AggrCandleManager.serverInstance){
            AggrCandleManager.serverInstance = new AggrCandleManager();
        }
        return AggrCandleManager.serverInstance;
    }

    getSymbolsData(){
        
    }
}