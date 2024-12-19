import { DataTransformer } from '../types/transformerTypes';

export abstract class BaseTransformer<T extends Record<string, any>, U> implements DataTransformer<T, U> {
  abstract transform(data: T): U;

  transformMany(data: T[]): U[] {
    return data.map(item => this.transform(item));
  }
}