export abstract class DatabaseService {
  abstract run(query: string, params: any[]): Promise<number>;

  abstract get<T>(query: string, params?: any[], rowMapper?: (row: any) => T);

  abstract all<T>(query: string, params?: any[], rowMapper?: (row: any) => T);

  abstract transaction(
    queries: { query: string; params: any[] }[],
  ): Promise<void>;
}
