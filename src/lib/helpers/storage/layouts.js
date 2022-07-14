import storage from "./index";
import { initialLayouts } from "components/organisms/TradeDashboard/ReactGridLayout/layoutSettings";

export const getLayout = () => {
  let layout = storage.getItem("layout");
  let layout_json;
  if (layout) layout_json = JSON.parse(layout);
  else layout_json = initialLayouts;
  return layout_json;
};
export const setLayout = (layout) => {
  storage.setItem("layout", JSON.stringify(layout));
  return layout;
};
