import { isSignal, writable } from 'spred';
import { classes } from './classes';

// (compat) tests are copied from clsx package tests
// (change) tests are copied from clsx package tests and changed due to spred-dom specialty

describe('classes function', () => {
  it('(compat) keeps object keys with truthy values', () => {
    const out = classes({
      a: true,
      b: false,
      c: 0,
      d: null,
      e: undefined,
      f: 1,
    });
    expect(out).toBe('a f');
  });

  it('(change: ignore non string values) joins arrays of class names and ignore falsy values', () => {
    const out = classes('a', 0, null, undefined, true as any, 1 as any, 'b');
    expect(out).toBe('a b');
  });

  it('(compat) supports heterogenous arguments', () => {
    expect(classes({ a: true }, 'b', 0)).toBe('a b');
  });

  it('(compat) should be trimmed', () => {
    expect(classes('', 'b', {}, '')).toBe('b');
  });

  it('(change) returns null for an empty configuration', () => {
    expect(classes({})).toBe(null);
  });

  it('(compat) supports an array of class names', () => {
    expect(classes(['a', 'b'])).toBe('a b');
  });

  it('(compat) joins array arguments with string arguments', () => {
    expect(classes(['a', 'b'], 'c')).toBe('a b c');
    expect(classes('c', ['a', 'b'])).toBe('c a b');
  });

  it('(compat) handles multiple array arguments', () => {
    expect(classes(['a', 'b'], ['c', 'd'])).toBe('a b c d');
  });

  it('(compat) handles arrays that include falsy and true values', () => {
    expect(classes(['a', 0, null, undefined, false, true, 'b'] as any)).toBe(
      'a b'
    );
  });

  it('(compat) handles arrays that include arrays', () => {
    expect(classes(['a', ['b', 'c']])).toBe('a b c');
  });

  it('(compat) handles arrays that include objects', () => {
    expect(classes(['a', { b: true, c: false }])).toBe('a b');
  });

  it('(compat) handles deep array recursion', () => {
    expect(classes(['a', ['b', ['c', { d: true }]]])).toBe('a b c d');
  });

  it('(compat) handles arrays that are empty', () => {
    expect(classes('a', [])).toBe('a');
  });

  it('(compat) handles nested arrays that have empty nested arrays', () => {
    expect(classes('a', [[]])).toBe('a');
  });

  it('(change: exclude fn) handles all types of truthy and falsy property values as expected', () => {
    const out = classes({
      // falsy:
      null: null,
      emptyString: '',
      noNumber: NaN,
      zero: 0,
      negativeZero: -0,
      false: false,
      undefined: undefined,

      // truthy (literally anything else):
      nonEmptyString: 'foobar',
      whitespace: ' ',
      emptyObject: {},
      nonEmptyObject: { a: 1, b: 2 },
      emptyList: [],
      nonEmptyList: [1, 2, 3],
      greaterZero: 1,
    });

    expect(out).toBe(
      'nonEmptyString whitespace emptyObject nonEmptyObject emptyList nonEmptyList greaterZero'
    );
  });

  it('returns signal if fn arguments passed', () => {
    expect(isSignal(classes(() => 'test'))).toBeTruthy();
    expect(isSignal(classes('foo', () => 'test'))).toBeTruthy();
    expect(isSignal(classes('foo', { bar: () => true }))).toBeTruthy();
  });

  it('handles fn and signal args', () => {
    const value = writable<any>(null);

    const s: any = classes(
      () => value() && 'test',
      'foo',
      () => 'bar',
      () => false
    );

    expect(s()).toBe('foo bar');

    value(true);
    expect(s()).toBe('foo test bar');
  });

  it('returns null if all fn results are falsy and there is no static classes', () => {
    const value = writable<any>(null);

    const s: any = classes(
      {
        test: value,
        qwe: () => false,
      },
      () => value() && 'bar'
    );

    expect(s()).toBe(null);

    value(true);
    expect(s()).toBe('test bar');
  });

  it('handles fn and signal keys', () => {
    const value = writable<any>(null);

    const s: any = classes({
      test: value,
      bar: () => true,
      qwe: () => false,
    });

    expect(s()).toBe('bar');

    value(true);
    expect(s()).toBe('test bar');
  });

  it('handles fn and signal keys mixed static classes', () => {
    const value = writable<any>(null);

    const s: any = classes('static class string', {
      test: value,
      foo: true,
      bar: () => true,
      qwe: () => false,
    });

    expect(s()).toBe('static class string foo bar');

    value(true);
    expect(s()).toBe('static class string foo test bar');
  });

  it('handles fn and signal elements of arrays', () => {
    const value = writable<any>(null);

    const s: any = classes(
      () => value() && 'test',
      'foo',
      true as any,
      ['a', () => 0],
      () => 'bar',
      [() => value() && 'b', ['c', () => value() && 'd', () => value()]],
      () => false
    );

    expect(s()).toBe('foo a bar c');

    value(true);
    expect(s()).toBe('foo test a bar b c d');
  });
});
