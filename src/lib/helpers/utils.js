
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeItemAll(arr, value) {
  const index = arr.indexOf(value);
  console.log(index, value);
  if (index !== -1) {
    arr.splice(index);
  }
  return arr;
}

