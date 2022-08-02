import { getLIS } from './list';

describe('getLIS function', () => {
  it('finds LIS and returns it as new array', () => {
    expect(getLIS([]).join()).toBe('');
    expect(getLIS([1]).join()).toBe('1');
    expect(getLIS([1, 2, 3]).join()).toBe('1,2,3');
    expect(getLIS([3, 2, 1]).join()).toBe('1');
    expect(getLIS([3, 2, 1, 4]).join()).toBe('1,4');
    expect(getLIS([3, -1, 2, 1, 4]).join()).toBe('1,4');
    expect(getLIS([2, 8, 9, 5, 6, 7, 1]).join()).toBe('2,5,6,7');
  });
});
