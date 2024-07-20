export enum CandleColor{
    Green,
    Red
}

export type Candle = {
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    color: CandleColor
    time: number,
    interval: string
}

export function createCandle([time, open, high, low, close, volume]: [number, number, number, number, number, number], interval : string): Candle {
    return {
        open,
        high,
        low,
        close,
        volume,
        color: getCandleColor(open, high, low, close),
        time,
        interval
    }
}

export function getCandleColor(o: number, h: number, l: number, c: number) {
    return c - o > 0 ? CandleColor.Green: CandleColor.Red;
}

export function getRunningCandleColor(o: number, h: number, l: number, ltp: number){
    return ltp - o > 0 ? CandleColor.Green: CandleColor.Red;
}



