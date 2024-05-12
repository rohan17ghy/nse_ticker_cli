export enum CandleColor{
    Green,
    Red
}

export function getCandleColor(o: number, h: number, l: number, c: number) {
    return c - o > 0 ? CandleColor.Green: CandleColor.Red;
}

export function getRunningCandleColor(o: number, h: number, l: number, ltp: number){
    return ltp - o > 0 ? CandleColor.Green: CandleColor.Red;
}

export function isFormingWPattern(){

}





