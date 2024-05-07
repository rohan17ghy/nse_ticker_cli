export function getNextInterval(timeframe: number): Date{
    if(timeframe <= 0){
        throw new RangeError(`${timeframe} is not greater than 0`);
    }

    const time = new Date();
    //console.log(`Current time: ${time}`);

    const minutes = time.getMinutes();
    const rem = minutes % timeframe

    var nextMinutes = minutes + (timeframe - rem);
    var nextHour = time.getHours();
    if (nextMinutes >= 60){
        nextMinutes = 0;
        nextHour += 1;
    }

    time.setHours(nextHour, 0, 0);
    time.setMinutes(nextMinutes, 0, 0);

    console.log(`Next history fetch time ${time}`);
    return time;
}

export function getMarketCloseTime(){
    const now = new Date();

    now.setHours(15);
    now.setMinutes(30);
    now.setSeconds(0);

    return now;
}

export function getMarketOpenTime(){
    const now = new Date();
    now.setHours(9);
    now.setMinutes(15);
    now.setSeconds(0);

    return now;
}

export function getPreviousDayCloseTime(){
    const now = new Date();

    now.setDate(now.getDate() - 1);
    now.setHours(15);
    now.setMinutes(30);
    now.setSeconds(0);

    return now;
}