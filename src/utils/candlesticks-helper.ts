export function findCandleColor(open: number, close: number){
    const isGreen = close - open > 0;
    return isGreen ? "G" : "R" 
}