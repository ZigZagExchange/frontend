import React from "react";
import cx from "classnames";
import Loader from "react-loader-spinner";
import "./Button.css";
import {x} from "@xstyled/styled-components";

// export const Button = (props) => {
//   const img = props.img && <img src={props.img} alt="..." />
//   const icon = props.icon && <span className="zig_btn_icon">{props.icon}</span>
//   const text = props.text || props.children
//   const loading = props.loading
//
//   const buttonContent = (
//     <>
//       {img}
//       {icon}
//       {' '}{text}
//     </>
//   )
//
//   const loadingContent = (
//     <span className="btn_loader">
//       <Loader
//         type="TailSpin"
//         color="#FFF"
//         height={24}
//         width={24}
//       />
//     </span>
//   )
//
//   return (
//     <button
//       type="button"
//       style={props.style}
//       className={cx("zig_btn", props.className, { 'zig_btn_loading': loading })}
//       onClick={loading ? null : props.onClick}
//     >
//       <span style={{ opacity: loading ? 0 : 1 }}>{buttonContent}</span>
//       {loading && loadingContent}
//     </button>
//   );
// };

const sizes = {
  xs: {
    px: 1.5,
    py: 1,
    borderRadius: 2,
    fontSize: 12
  },
  sm: {
    py: 2,
    px: 4,
    borderRadius: 3,
    fontSize: 14
  },
  md: {
    p: 4,
    borderRadius: 4,
    fontSize: 22
  }
}
const variants = {
  primary: {
    backgroundImage: {_: 'gradient-to-r', disabled: "none"},
    backgroundColor: {disabled: "blue-400"},
    gradientFrom: {_: 'blue-100', disabled: "none"},
    gradientVia: 'blue-200',
    gradientTo: 'teal-100',
    border: 'none',
    color: {_: "white", disabled: "blue-300"},
    fontWeight: 'bold'
  },
  secondary: {
    backgroundColor: {_: "blue-600", hover: "black"},
    color: {_: "teal-200", hover: "blue-100"},
    border: "none"
  }
}

export const Button = ({
                         variant = "primary",
                         size = "sm",
                         children,
                         isLoading,
                         type = "button",
                         isDisabled,
                         block,
                         onClick
                       }) => {
  return <x.div position={"relative"} w={block ? "full" : "fit-content"}>
    {isLoading &&
      <x.div
        left={0}
        top={0}
        w={"full"}
        h={"full"}
        position={"absolute"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        background={"rgba(0,0,0,0.6)"}
        zIndex={2}
      >
        <Loader
          type="TailSpin"
          color="white"
          height={24}
          width={24}
        />
      </x.div>}
    <x.button
      onClick={onClick}
      type={type}
      disabled={isDisabled}
      position={"relative"}
      {...variants[variant]}
      {...sizes[size]}
      w={"full"}
    >
      {children && children}
    </x.button>
  </x.div>
}
