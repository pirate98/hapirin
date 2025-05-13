export default class DateTimeUtils {
  static convertDate_YYYYMMdd(newDate: Date) {
    var year = newDate.getFullYear();
    var month =
      newDate.getMonth() + 1 < 10
        ? '0' + (newDate.getMonth() + 1)
        : newDate.getMonth() + 1;
    var date =
      newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();
    return `${year}${month}${date}`;
  }

  static getTomorrowDate(now: Date) {
    var year = now.getFullYear();
    var month =
      now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var date =
      now.getDate() + 1 < 10 ? '0' + (now.getDate() + 1) : now.getDate() + 1;
    return `${year}${month}${date}`;
  }
}
