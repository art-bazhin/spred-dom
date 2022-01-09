export function isFalsy(value: any): value is null | undefined | false {
  return value === null || value === undefined || value === false;
}
