import { Signal } from '@spred/core';

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

export type WritableNonFnKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    (() => any) extends T[P] ? never : P,
    never
  >;
}[keyof T];

export type Binding<T> = T | (() => T) | Signal<T>;
