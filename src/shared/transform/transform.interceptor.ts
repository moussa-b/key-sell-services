import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.cleanNullValues(data)),
      map((data) => this.convertDatesToString(data)),
    );
  }

  private cleanNullValues(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.cleanNullValues(item));
    } else if (
      typeof data === 'object' &&
      data !== null &&
      !(data instanceof Date)
    ) {
      return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== null) {
          acc[key] = this.cleanNullValues(value);
        }
        return acc;
      }, {});
    }
    return data;
  }

  private convertDatesToString(data: any): any {
    if (Array.isArray(data)) {
      // Recursively process arrays
      return data.map((item) => this.convertDatesToString(item));
    } else if (typeof data === 'object' && data !== null) {
      // Recursively process objects
      return Object.entries(data).reduce((acc, [key, value]) => {
        if (value instanceof Date) {
          acc[key] = value.toISOString(); // Convert Date to string
        } else {
          acc[key] = this.convertDatesToString(value); // Recurse for nested structures
        }
        return acc;
      }, {});
    }
    return data;
  }
}
