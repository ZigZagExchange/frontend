
export const max = (maxValue, customErrorString) => (formValue) => {
    const error = customErrorString ? customErrorString : `Max value: ${maxValue}`
    if (formValue > maxValue) {
        return error
    }
}

export const min = (minValue, customErrorString) => (formValue) => {
    const error = customErrorString ? customErrorString : `Min value: ${minValue}`
    if (formValue < minValue) {
        return error
    }
}

export const requiredError = "required"
export const required = (formValue) => {
  if (formValue === null || formValue === undefined || formValue === "") {
    return requiredError
  }
}

export const gte = (greaterThan, customErrorString) => (formValue) => {
  const error = customErrorString ? customErrorString : `Must be greater than or equal to ${greaterThan}`
  if (formValue < greaterThan) {
    return error
  }
}

export const forceValidation = (showThrow, errorMessage) => (formValue) => {
  if (showThrow) {
    return errorMessage
  }
}

export const composeValidators = (...validators) => (value) =>
  validators.reduce((error, validator) => error || validator(value), undefined)

