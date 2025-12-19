export const isDefined = <T>(variable: T | undefined): variable is T =>
  variable !== undefined;
