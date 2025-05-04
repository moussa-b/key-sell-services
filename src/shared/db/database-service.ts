import { LabelValue } from '../dto/label-value.dto';

export abstract class DatabaseService {
  abstract run(query: string, params: any[]): Promise<number>;

  abstract get<T>(query: string, params?: any[], rowMapper?: (row: any) => T);

  abstract all<T>(query: string, params?: any[], rowMapper?: (row: any) => T);

  abstract batchInsert(query: string, params: any[][]): Promise<number>;

  abstract transaction(
    queries: { query: string; params: any[] }[],
  ): Promise<void>;

  labelValueRowMapper(row: any): LabelValue<number> {
    const labelValue = new LabelValue<number>();
    labelValue.label = row['label'];
    labelValue.value = row['value'];
    return labelValue;
  }
}
