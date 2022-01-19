import React from "react";
import { x } from "@xstyled/styled-components"
import {DefaultTemplate} from "../../templates/DefaultTemplate";
import Pane from "../../atoms/Pane/Pane";
import FormDemo from "../../atoms/Form/Form.demo";
import TooltipDemo from "../../atoms/Tooltip/Tooltip.demo";

const DSLPage = () => {
    return <DefaultTemplate>
        <div style={{height: "calc(100vh - 80px)"}}>
            <x.div
                h={"100%"}
                padding={2}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                backgroundColor={"blue-400"}
                color={"white"}
            >
                <x.span fontSize={24} mb={3} mt={5}>
                    DSL
                </x.span>
              <x.div spaceY={6}>
                <DSLItem title={"Form"}>
                  <FormDemo/>
                </DSLItem>
                <DSLItem title={"Tooltip"}>
                  <TooltipDemo/>
                </DSLItem>
              </x.div>
            </x.div>
        </div>
    </DefaultTemplate>
}

const DSLItem = ({title, children}) => {
    return <Pane size={"sm"} variant={"light"} w={"lg"}>
        <x.div fontSize={18}>
            {title}
        </x.div>
        {children && children}
    </Pane>
}

export default DSLPage;
