import { AggrMessageType } from "../sockets/aggrCandleManager";
import { Candle, CandleColor, createCandle } from "../technicals/candlesticks";

export interface APIOptionChainData {
    symbol: string;
    data: Candle[];
}

export interface AggrPremiumCandle {
    time: number;
    aggrCandles: {
        symbol: string;
        candle: Candle;
    }[];
}

// export type ChartCandle = {
//     time: number;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     color?: string;
// }


export const aggregateOptionsData = (apiOptionChainData: APIOptionChainData[]): AggrPremiumCandle[] => {
    const groupedData: { [key: number]: { symbol: string, candle: Candle }[] } = {};
    
    apiOptionChainData.forEach(item => {
      item.data.forEach(candle => {
        if (!groupedData[candle.time]) {
          groupedData[candle.time] = [];
        }
        groupedData[candle.time].push({
          symbol: item.symbol,
          candle: candle
        });
      });
    });
    
    const result: AggrPremiumCandle[] = Object.keys(groupedData).map(time => ({
      time: parseInt(time),
      aggrCandles: groupedData[parseInt(time)]
    }));
  
    return result;
};

export function transformToChartData(symbol: string, optionType:"CE" | "PE", aggrPremiumCandles: AggrPremiumCandle[]): Candle[] {
    return aggrPremiumCandles
    .filter(candle => candle?.aggrCandles && candle.aggrCandles.length > 0)
    .map(candle => {

        // const itmCandle = candle.aggrCandles
        // .reduce((max, currCandle) => {
        //     if(optionType == "CE"){
        //         return currCandle.symbol < max.symbol ? currCandle : max;
        //     }else{
        //         return currCandle.symbol > max.symbol ? currCandle : max;
        //     }
        // }, candle.aggrCandles[0])
        // ?.candle;
        const inpSymbol = candle.aggrCandles.filter(obj => obj.symbol == symbol)[0]?.candle;
        
        //Finding a combined color. If both green and red color is present then color is set to blue
        const color: CandleColor = candle.aggrCandles.reduce((color, currCandle) => {
            if (currCandle.candle.color != color){
                color = CandleColor.Blue;
            }
            return color
        }, candle.aggrCandles[0].candle.color);

        inpSymbol.color = color

        return inpSymbol;
    });
}


function incrementStrike(symbol: string) {
    const strike = symbol.substring(symbol.length - 7, symbol.length - 2);
    const newStrike = parseInt(strike) + 100;
    return symbol.substring(0, symbol.length - 7) + newStrike + symbol.substring(symbol.length - 2);
}

function decrementStrike(symbol: string){
    const strike = symbol.substring(symbol.length - 7, symbol.length - 2);
    const newStrike = parseInt(strike) - 100;
    return symbol.substring(0, symbol.length - 7) + newStrike + symbol.substring(symbol.length - 2);
}

// export function getCEStrikes(ceStrikeStart: string, ceStrikeEnd: string){
//     let currentStrike = ceStrikeStart;
//     const strikes = []
//     while(currentStrike >= ceStrikeEnd){
//         strikes.push(currentStrike);
//         currentStrike = decrementStrike(currentStrike);
//     }

//     return strikes
// }

// export function getPEStrikes(peStrikeStart: string, peStrikeEnd: string){
//     let currentStrike = peStrikeStart;
//     const strikes = []
//     while(currentStrike <= peStrikeEnd){
//         strikes.push(currentStrike);
//         currentStrike = incrementStrike(currentStrike);
//     }

//     return strikes;
// }

export function getStrikes(aggrInp: AggrMessageType) {
    let currentStrike = aggrInp.start;
    const strikes = [];

    const isAscending = aggrInp.optionType === "CE";
    const compareFn = isAscending ? (a: string, b: string) => a >= b : (a: string, b: string) => a <= b;
    const updateFn = isAscending ? decrementStrike : incrementStrike;

    while (compareFn(currentStrike, aggrInp.end)) {
        strikes.push(currentStrike);
        currentStrike = updateFn(currentStrike);
    }

    return strikes;
}