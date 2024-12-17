export abstract class BaseTransformer<T, U> {
  abstract transform(data: T): U;
  
  transformMany(items: T[]): U[] {
    return items.map(item => this.transform(item));
  }
}