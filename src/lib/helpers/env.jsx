export const isDev = () => process.env.NODE_ENV === "development";
export const Dev = ({ children }) => {
  return isDev() ? children : <></>;
};
