import React from "react";
import { x } from "@xstyled/styled-components"
import {DefaultTemplate} from "../../templates/DefaultTemplate";
import Pane from "../../atoms/Pane/Pane";
import FormDemo from "../../atoms/Form/Form.demo";
import ButtonDemo from "../../atoms/Button/Button.demo";

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
                <DSLItem title={"Button"}>
                    <ButtonDemo />
                </DSLItem>
                <DSLItem title={"Form"}>
                    <FormDemo />
                </DSLItem>
            </x.div>
        </div>
    </DefaultTemplate>
}

const DSLItem = ({title, children}) => {
    return <Pane size={"sm"} variant={"light"} minW={96}>
        <x.div fontSize={18}>
            {title}
        </x.div>
        {children && children}
    </Pane>
}

export default DSLPage;
