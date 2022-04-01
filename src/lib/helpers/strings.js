export const jsonify = (string, prettyPrint = false) => {
  if (prettyPrint) {
    return JSON.stringify(string, null, 4);
  }
  return JSON.stringify(string);
};
