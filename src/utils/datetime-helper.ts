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