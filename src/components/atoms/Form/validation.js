export const max = (maxValue, customErrorString) => (formValue) => {
  const error = customErrorString
    ? customErrorString
    : `Max value: ${maxValue}`;
  if (Number(formValue) > Number(maxValue)) {
    return error;
  }
};

export const min = (minValue, customErrorString) => (formValue) => {
  const error = customErrorString
    ? customErrorString
    : `Min value: ${minValue}`;
  if (Number(formValue) < Number(minValue)) {
    return error;
  }
};

export const requiredError = "required";
export const required = (formValue) => {
  if (formValue === null || formValue === undefined || formValue === "") {
    return requiredError;
  }
};

export const forceValidation = (showThrow, errorMessage) => (formValue) => {
  if (showThrow) {
    return errorMessage;
  }
};

export const composeValidators =
  (...validators) =>
  (value) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined
    );
