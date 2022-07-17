import storage from "./index";

export const getLayout = () => {
  var layout_json = parseInt(storage.getItem("layout")) || 0;
  return layout_json;
};
export const setLayout = (layout) => {
  storage.setItem("layout", layout);
  return layout;
};
