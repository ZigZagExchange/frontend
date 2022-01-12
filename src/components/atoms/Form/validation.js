
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



