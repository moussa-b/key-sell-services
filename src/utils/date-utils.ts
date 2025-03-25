export class DateUtils {
  /**
   * Combines a date string in `dd.mm.yyyy` format and a time string in `hh:mm` format
   * into a JavaScript Date object.
   */
  static createDate(startDate: string, startHour: string): Date {
    const [day, month, year] = startDate.split('.');
    const isoString = `${year}-${month}-${day}T${startHour}`;
    return new Date(isoString);
  }

  /**
   * Combines a date string in `dd.mm.yyyy` format and a time string in `hh:mm` format
   * into database date format.
   */
  static createDateTimeToDatabaseFormat(
    startDate: string,
    startHour: string,
  ): string {
    const [day, month, year] = startDate.split('.');
    const isoString = `${year}-${month}-${day}T${startHour}`;
    return DateUtils.formatToDatabaseDateTimeFormat(new Date(isoString));
  }

  /**
   * Convert a date string in `dd.mm.yyyy` format into database date format.
   */
  static createDateToDatabaseFormat(startDate: string): string {
    const [day, month, year] = startDate.split('.');
    return `${year}-${month}-${day}`;
  }

  /**
   * Converts a database datetime string with format `yyyy-mm-dd hh:mm:ss` to a Date
   * @param date - The string object representing database-friendly format: `yyyy-mm-dd hh:mm:ss` to be parsed
   */
  static createDateFromDatabaseDate(date: string): Date | undefined {
    if (!date) {
      return undefined;
    }
    const [datePart, timePart] = date!.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  /**
   * Formats a JavaScript Date object to a database-friendly format: `yyyy-mm-dd hh:mm:ss`
   * @param date - The Date object to format
   */
  static formatToDatabaseDateTimeFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  static formatToFileName(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
  }
}
