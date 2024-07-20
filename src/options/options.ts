import { Candle } from "../technicals/candlesticks";

export interface APIOptionChainData {
    symbol: string;
    data: Candle[];
}

export interface StrikeAggrOptionChainData {
    time: number;
    data: {
        symbol: string;
        candle: Candle;
    }[];
}

// export const transformOptionsData = (data: APIOptionChainData[]): StrikeAggrOptionChainData[] => {
//     const groupedData = data.reduce((acc, { symbol, data }) => {
//       data.forEach(([time, ...candle]) => {
//         if (!acc.has(time)) {
//           acc.set(time, []);
//         }
//         acc.get(time)?.push({ symbol, candle });
//       });
//       return acc;
//     }, new Map<number, { symbol: string; candle: [number, number, number, number, number] }[]>());
  
//     return Array.from(groupedData, ([time, data]) => ({ time, data }));
// };

export const aggregateOptionsData = (data: APIOptionChainData[]): StrikeAggrOptionChainData[] => {
    const groupedData: { [key: number]: { symbol: string, candle: Candle }[] } = {};
    
    data.forEach(item => {
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
    
    const result: StrikeAggrOptionChainData[] = Object.keys(groupedData).map(time => ({
      time: parseInt(time),
      data: groupedData[parseInt(time)]
    }));
  
    return result;
};
  


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

export function getCEStrikes(ceStrikeStart: string, ceStrikeEnd: string){
    let currentStrike = ceStrikeStart;
    const strikes = []
    while(currentStrike >= ceStrikeEnd){
        strikes.push(currentStrike);
        currentStrike = decrementStrike(currentStrike);
    }

    return strikes
}

export function getPEStrikes(peStrikeStart: string, peStrikeEnd: string){
    let currentStrike = peStrikeStart;
    const strikes = []
    while(currentStrike <= peStrikeEnd){
        strikes.push(currentStrike);
        currentStrike = incrementStrike(currentStrike);
    }

    return strikes;
}