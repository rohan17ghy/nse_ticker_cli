import { Candle, CandleColor, isGreenCandle } from "./candlesticks";

/**Local valley is the point from which the 2 continuos candles start forming
For HH/HL localValley should be the start of 1st leg of the HH/HL price action
For W pattern local Valley will be the start of the 2nd leg of W pattern. Immediate means the first local Valley from the end*/
const immediateLocalValley = (candles: Candle[]) : number => {
    //Not considering the running candle
    const n = candles.length - 1;
    for (let i = n-2; i > 0; i--) {
        if(n < 3){
            return -1;
        }
        
        if(candles[i].low < candles[i-1].low && candles[i].low < candles[i+1].low){
            return i;
        }
    }

    return candles[0].low < candles[n-1].low ? 0 : n-1;
}

const isTwoContGreenCandlesFormed = (candles: Candle[]): boolean => {
    // Check for minimum number of candles
    const n = candles.length - 1;
    if (n < 2) return false;

    
    for (let i = 0; i < n - 1; i++) {
        const firstCandle = candles[i];

        // Check if the first candle is green
        if (isGreenCandle(firstCandle)) {
            for (let j = i + 1; j < n; j++) {
                const secondCandle = candles[j];

                // Check if the second candle is green and not an inside candle
                const isSecondCandleGreen = isGreenCandle(secondCandle);
                const isNotInsideCandle = secondCandle.high > firstCandle.high;

                if (isSecondCandleGreen && isNotInsideCandle) {
                    return true;
                }
            }
        }
    }

    return false;
}