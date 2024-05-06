import { getAccessToken } from "../fyers";
import { FyersOrderSocket } from "../fyers";

var fyersOrderSocket: any;

export function recieveOrderDetails() {

    if(!fyersOrderSocket){
        fyersOrderSocket = new FyersOrderSocket(getAccessToken());
        console.log('Orders socket created');
    }

    fyersOrderSocket.on("error",function (errmsg: any) {
        console.log(errmsg)
    })
    
    fyersOrderSocket.on('connect',function () {
        fyersOrderSocket.subscribe([fyersOrderSocket.orderUpdates])
    })
    
    fyersOrderSocket.on('close',function () {
        console.log('orders web socket closed');
    })
    
    //for ticks of orderupdates
    fyersOrderSocket.on('orders',function (msg: any) {
        console.log(`orders: ${JSON.stringify(msg)}`);
    })
    
    fyersOrderSocket.on('general',function (msg: any) {
        console.log(`general: ${JSON.stringify(msg)}`)
    })

    //for ticks of tradebook
    fyersOrderSocket.on('trades',function (msg: any) {
        console.log(`trades ${JSON.stringify(msg)}`)
    })

    fyersOrderSocket.on('positions',function (msg: any) {
        console.log(`positions: ${JSON.stringify(msg)}`)
    })

    console.log('Connecting...');
    fyersOrderSocket.autoreconnect()
    fyersOrderSocket.connect()
    console.log('Connected');
}