import {getCandleColor} from '../technicals/candlesticks';

const whitespaces = "   ";

// function logCandlesForSymbols(candles: any[]){
//     let logString = '';
//     candles.forEach((candle) => {
//         const high = candle[2];

//         logString += `${high}`
//         logString += whitespaces;
//     });

//     console.log(logString);
//     logString = '';

//     candles.forEach((candle) => {
//         const candleColor = getCandleColor(candle[1], candle[2], candle[3], candle[4]);

//         logString += `${candleColor}`;
//         for(let i = 0; i < 3; i++){
//             logString += whitespaces;
//         }
        
//     })

//     console.log(logString);
//     logString = '';

//     candles.forEach((candle) => {
//         const low = candle[3];

//         logString += `${low}`;
//         logString += whitespaces;
        
//     })

//     console.log(logString);
// }

function logCandlesForSymbols(candles: any[]){
    console.log(`Candles: ${JSON.stringify(candles)}`);
    const candlesLogObject = candles.map((candle) => {
        return {
            high: `${candle[2]}`,
            color: `${getCandleColor(candle[1], candle[2], candle[3], candle[4])}`,
            low: `${candle[3]}`
        };
    });

    // Transpose the data
    const transposedData = transpose(candlesLogObject.map(Object.values));

    // Log column-wise
    console.table(transposedData);
}

export function logSymbol(symbol: any){
    logCandlesForSymbols(symbol.candles);
    console.log('\n');
}

function transpose(matrix: any[]) {
    return matrix[0].map((_: any, colIndex: any) => matrix.map(row => row[colIndex]));
}



