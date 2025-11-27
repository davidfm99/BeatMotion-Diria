export function getNextPaymentDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  // mes siguiente
  const nextMonth = (month + 1) % 12;
  const nextMonthYear = month === 11 ? year + 1 : year;

  let targetDay;

  if (day <= 15) {
    // next payment will be the 15th of next month in case the day is less than 15
    targetDay = 15;
  } else {
    //next payment will be 30th in case the day is more than 15th
    if (nextMonth === 1) {
      //february case
      if (nextMonth === 1) {
        targetDay = isLeap(nextMonthYear) ? 29 : 28;
      }
    } else {
      targetDay = 30;
    }
  }

  const nextPaymentDate = new Date(nextMonthYear, nextMonth, targetDay);

  return nextPaymentDate;
}

function isLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
