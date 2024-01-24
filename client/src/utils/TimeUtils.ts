export const formatToMinutes = (secondsSt: string): string => {
  let seconds = parseInt(secondsSt, 10);
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  if (secondsLeft === 0) {
    return `${minutes} MIN`;
  }
  return `${minutes}:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;
};

export const minfiedDate = (inputDate: string): string => {
  const date = new Date(inputDate);

  // Array of month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  // Format the date
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}. ${month} ${year}`;
};
