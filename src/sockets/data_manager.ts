import WebSocket, { WebSocketServer } from "ws";
import { MinuteEventEmitter } from "../utils";
import { get1minCandles } from "../technicals/history";

type WSMessageType = {
    type: "SUBSCRIBE" | "UNSUBSCRIBE",
    symbol: string
} | AggrMessageType;


export type AggrMessageType = {
    type: "SUBSCRIBE_AGGR_OPTIONS" | "UNSUBSCRIBE_AGGR_OPTIONS",
    start: string, 
    end: string, 
    optionType: "CE" | "PE"
};



export class DataManager {
    private wss: WebSocketServer;
    private static serverInstance: DataManager;
    private symbols: string[];
    private aggrOptions: {start: string, end: string, optionType: "CE" | "PE"}[];

    private constructor() {        
        this.wss = new WebSocketServer({ port : 8086});
        this.symbols = [];
        this.aggrOptions = [];
        this.init();
    }

    init(){
        this.wss.on('connection', (ws: WebSocket) => {
            console.log(`New client connected`);

            ws.on('message', (bufferedData: Buffer) => {
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
                    this.aggrOptions?.push(aggrInp)

                    const minuteEmitter = new MinuteEventEmitter(1);
                    minuteEmitter.on("minuteEvent", async (date) => {
                        const candles = await get1minCandles(data);
                        console.log(`Data: ${date},  Candles: ${JSON.stringify(candles)}`);
                        ws.send(JSON.stringify(candles));
                    });

                    console.log(`Subscribed to aggr options: ${JSON.stringify(aggrInp)}`);
                }
                else if(data.type == "UNSUBSCRIBE_AGGR_OPTIONS"){
                    const index = this.aggrOptions?.findIndex((obj) => obj.start === data.start && obj.end === data.end && obj.optionType === data.optionType);
                    if(index !== -1){
                        this.aggrOptions?.splice(index, 1);
                    }
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

        });

        console.log('WebSocket server is running on ws://localhost:8086');
    }

    static getInstance(){
        if(!DataManager.serverInstance){
            DataManager.serverInstance = new DataManager();
        }
        return DataManager.serverInstance;
    }

    getSymbolsData(){
        
    }
}