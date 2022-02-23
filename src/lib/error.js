export default class ZZError extends Error {
  isZZError = true;

  constructor(message, name, code = 500) {
    super(message);
    this.name = name || this.constructor.name;
    this.statusCode = code;
  }
}
