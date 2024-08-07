export enum CandleColor {
    Green = "Green",
    Red = "Red",
    Blue = "Blue"
}


export type Candle = {
    symbol: string,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    color: CandleColor
    time: number,
    interval: string
}

export function createCandle(symbol: string, [time, open, high, low, close, volume]: [number, number, number, number, number, number], interval : string): Candle {
    return {
        symbol,
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

export function isGreenCandle(candle: Candle) {
    return candle.color == CandleColor.Green || candle.color == CandleColor.Blue
}

export function isRedCandle(candle: Candle){
    return candle.color == CandleColor.Red || candle.color == CandleColor.Blue
}



