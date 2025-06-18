// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const restrictFromProduction = (env: string | undefined) => (value: any) => {
  if (env === 'production') {
    return undefined;
  }

  return value;
};
