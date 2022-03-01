import React from "react";
import { x } from "@xstyled/styled-components";

const ExternalLink = ({ href, children }) => {
  return (
    <x.a
      href={href}
      target={"_blank"}
      color={{ _: "blue-gray-400", hover: "blue-100" }}
    >
      {children}
    </x.a>
  );
};

export default ExternalLink;
