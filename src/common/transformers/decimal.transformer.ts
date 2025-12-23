export const decimalTransformer = {
  to: (value?: number) => value,
  from: (value?: string | number | null) =>
    value === null || value === undefined ? null : Number(value),
};
