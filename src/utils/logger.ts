import {Candle, CandleColor, getCandleColor} from '../technicals/candlesticks';
import { convertToLocalTime } from './datetime-helper';

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
        let candleStartTime = convertToLocalTime(candle[0]);
        return {
            high: `${candle[2]}`,
            color: `${getCandleColor(candle[1], candle[2], candle[3], candle[4])}`,
            low: `${candle[3]}`,
            empty: '',
            time: `${candleStartTime}`

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

export function logChartDataInConsole(candles: Candle[]) {
    const tableData = candles.map(candle => ({
        Open: candle.open,
        Close: candle.close,
        Color: `${candle.color == CandleColor.Blue ? '<---------Blue--------->' : candle.color}`,
        Time: new Date(candle.time).getTime()
    }));    

    console.table(tableData);
}

// Function to combine and log tables side by side
export function logCombinedTables(ceCandles: Candle[], peCandles: Candle[]) {
    const maxLength = Math.max(ceCandles.length, peCandles.length);
    const combinedData = [];

    for (let i = 0; i < maxLength; i++) {
        const ce = ceCandles[i] || { open: '', close: '', color: '', time: '' };
        const pe = peCandles[i] || { open: '', close: '', color: '', time: '' };

        combinedData.push({
            'CE Open': ce.open,
            'CE Close': ce.close,
            'CE Color': `${ce.color == CandleColor.Blue ? '<---------Blue--------->' : ce.color}`,
            'CE Time': new Date(ce.time * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false
            }),
            '---': `|`,
            '----': `|`,
            'PE Open': pe.open,
            'PE Close': pe.close,
            'PE Color': `${pe.color == CandleColor.Blue ? '<---------Blue--------->' : pe.color}`,
            'PE Time': new Date(pe.time * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false
            })
        });
    }
    console.clear();
    console.table(combinedData);
}



