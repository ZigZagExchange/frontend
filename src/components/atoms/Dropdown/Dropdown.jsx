import RCDropdown from "rc-dropdown";
import Menu, { Item as MenuItem, Divider } from "rc-menu";
import cx from "classnames";
import "rc-dropdown/assets/index.css";

export const Dropdown = ({ children, overlayClassName, ...props }) => {
  return (
    <RCDropdown
      trigger={["click"]}
      animation="slide-up"
      overlayClassName={cx("zig-dropdown", overlayClassName)}
      {...props}
    >
      {children}
    </RCDropdown>
  );
};

export { Menu, MenuItem, Divider };
