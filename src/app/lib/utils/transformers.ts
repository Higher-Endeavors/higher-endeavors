type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T>
    ? `_${Lowercase<T>}${CamelToSnakeCase<U>}`
    : `${T}${CamelToSnakeCase<U>}`
  : S;

type TransformKeys<T> = {
  [K in keyof T as K extends string ? CamelToSnakeCase<K> : K]: T[K] extends object
    ? TransformKeys<T[K]>
    : T[K];
};

export const transformFormToDatabase = <T extends object>(data: T): TransformKeys<T> => {
    const transformed: Record<string, any> = {}; 
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      transformed[snakeKey] = Array.isArray(value)
        ? value.map(item => 
            typeof item === 'object' && item !== null 
              ? transformFormToDatabase(item)
              : item
          )
        : typeof value === 'object' && value !== null
          ? transformFormToDatabase(value)
          : value;
    }
  
    return transformed as TransformKeys<T>;
  };