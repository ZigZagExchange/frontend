export const model = (value, setter) => {
  return {
    value,
    onChange: (val) => setter(val),
  };
};
