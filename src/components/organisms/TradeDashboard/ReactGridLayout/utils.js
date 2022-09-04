// Some App webviews are rendered too late and will have an innerHeight of 0
// The situation needs to be addressed with a compatible solution

export const innerHeight =
  window.innerHeight > 0 ? window.innerHeight : window.screen.height;

export const rowHeight = (innerHeight - 112) / 30;
