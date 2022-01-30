import React from 'react';
import {x} from "@xstyled/styled-components"

const sizesTrack = {
  sm: {
    w: "45px",
    p: 1
  },
  md: {
    w: "70px",
    p: 1.5
  }
}

const sizesThumb = {
  sm: {
    w: "15px",
    h: "15px"
  },
  md: {
    w: "25px",
    h: "25px"
  }
}

const variantsTrack = {
  primary: {
    bg: "blue-400"
  }
}

const variantsThumb = {
  primary: {
    bg: "white"
  }
}

const Toggle = ({
    size = "sm",
    variant = "primary",
    onClick,
    value = false
}) => {
  return <x.div
    {...sizesTrack[size]}
    {...variantsTrack[variant]}
    backgroundImage={value ? "linear-gradient(to right, #09aaf5, #05cfe9, #62D2AD)" : "none"}
    cursor={"pointer"}
    position={"relative"}
    borderRadius={"full"}
    onClick={() => {
      onClick && onClick(!value)
  }}>
    <x.div
      {...sizesThumb[size]}
      {...variantsThumb[variant]}
      transition
      transitionProperty={"left"}
      transitionDuration={250}
      position={"relative"}
      // TODO: fix me
      left={value ? '58%' : 0}
      borderRadius={"full"}
    />
  </x.div>
}


export default Toggle
