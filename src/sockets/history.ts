import { fyers, getAccessToken } from "../fyers";

export async function getFirstCandleInfo(): Promise<any> {
    fyers.setAccessToken(getAccessToken());
    const range_from = new Date('2024-04-19T09:15:00');
    const range_to = new Date('2024-04-19T09:15:00');
    
    var inp={
        "symbol":"NSE:NIFTY24APR21750CE",
        "resolution":"1",
        "date_format":"0",
        "range_from": convertToEpoch(range_from),
        "range_to": convertToEpoch(range_to),
        "cont_flag":"1"
    }

    await fyers.getHistory(inp).then((response: any)=>{
        console.log(`First candle date: ${JSON.stringify(response)}`);
    }).catch((err: any)=>{
        console.log(`Error: ${JSON.stringify(err)}`);
    })

}


function convertToEpoch(dateTime: Date): Number{
    console.log(`DateTime: ${dateTime}`);
    return Math.floor(dateTime.getTime() / 1000);
}