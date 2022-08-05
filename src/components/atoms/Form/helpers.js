export const model = (value, setter) => ({
    value,
    onChange: (val) => setter(val),
});
