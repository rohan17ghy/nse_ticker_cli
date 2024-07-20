import { EventEmitter } from 'events';

export class MinuteEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupInitialTimeout();
  }

  private setupInitialTimeout() {
    const now = new Date();
    // 1 extra second is taken for avoiding any corner cases where time is exactly at the starting minute. For ex: 5:31:00 AM
    const msUntilNextMinute = (61 - now.getSeconds()) * 1000 - now.getMilliseconds(); 
    
    setTimeout(() => {
      this.emit('minuteEvent', new Date());
      this.setupRecurringInterval();
    }, msUntilNextMinute);
  }

  private setupRecurringInterval() {
    setInterval(() => {
      this.emit('minuteEvent', new Date());
    }, 60000); // 60000 milliseconds = 1 minute
  }
}


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

export function convertToEpoch(dateTime: Date): Number{
    //console.log(`DateTime: ${dateTime}`);
    return Math.floor(dateTime.getTime() / 1000);
}

//Converting epoch to datetime
export function convertToLocalTime(epoch: number){
    let utcTime = new Date(epoch * 1000);
    let localTime = utcTime.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
    return localTime;
}

/**
 * Formats the date in ISO format i.e. YYYY-MM-DD
 * @param dateStr 
 * @returns DateTime object
 */
export function formatDateToISO(dateStr: string) {
    // Define the month map
    const months : {[key: string]: string} = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12'
    };
  
    // Split the date string into components
    const [day, month, year] = dateStr.split('-');
  
    // Format the date as YYYY-MM-DD
    const formattedDate = `${year}-${months[month]}-${day}`;
  
    return formattedDate;
  }