import { getAccessToken } from "../fyers";
import { FyersSocket } from "../fyers";

var fyerssocket: any = null;

function onmsg(message: any){
    console.clear();
    console.log(`Recieved message from server: ${JSON.stringify(message)}`)
}

function onconnect(){
    console.log('On Connect from server...');
    fyerssocket.subscribe(['MCX:CRUDEOILM24APRFUT']) //not subscribing for market depth data
    // fyersdata.mode(fyersdata.LiteMode) //set data mode to lite mode
    // fyersdata.mode(fyersdata.FullMode) //set data mode to full mode is on full mode by default
    fyerssocket.autoreconnect(6) //enable auto reconnection mechanism in case of disconnection
}

function onerrorsocket(err: any){
    console.log(`Error on socket: ${JSON.stringify(err)}`)
}

function onclosesocket(){
    console.log("socket closed")
}

export function getMarketData() {
    
    fyerssocket = new FyersSocket(getAccessToken())

    fyerssocket.on("message",onmsg)
    fyerssocket.on("connect",onconnect)
    fyerssocket.on("error",onerrorsocket)
    fyerssocket.on("close",onclosesocket)

    fyerssocket.connect()
    
}