export class RepetitionOptions {
  /**
   * Array of integers representing the days on which the appointment must repeat,
   * where 1 stands for Monday and 7 stands for Sunday.
   * Example: [1, 3, 5]
   */
  days: number[];
  /**
   * The repetition period in weeks.
   * Example: 1
   */
  repetition: number;
  /**
   * The date until which the event will keep repeating (inclusive).
   * The number of repetitions is not used if the endDate is set.
   * Example: "2000-12-31"
   */
  endDate?: string;
  /**
   * The maximum number of repetitions. Can't be used if endDate is set.
   * Example: 4
   */
  nbOccurrences?: number;
}
