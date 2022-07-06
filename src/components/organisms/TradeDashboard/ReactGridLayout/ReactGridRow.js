import React, { useState, useLayoutEffect } from "react";
import { Responsive } from "react-grid-layout";
//import { Responsive, WidthProvider } from "react-grid-layout";

import { default as WidthProvider } from "./ReactSizeMe";

import { Row, Col } from "antd";

const ResponsiveGridLayout = WidthProvider(Responsive);

/*const documentIsFinishedLoading = () => {
  return /^complete|^i|^c/.test(document.readyState);
};*/

/*const doWhenDocumentReadyStateIsComplete = doWork => {
  let intervalId;

  if (documentIsFinishedLoading()) {
    doWork();
  } else {
    intervalId = setInterval(() => {
      if (documentIsFinishedLoading()) {
        doWork();
        clearInterval(intervalId);
      }
    }, 250);
  }
};*/
const triggerWindowResize = () => {
  var evt = window.document.createEvent("UIEvents");
  evt.initUIEvent("resize", true, false, window, 0);
  setTimeout(() => window.dispatchEvent(evt), 100);
};

const GridLayoutRow = (props) => {
  //const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  console.log("props.layoutis", props.layouts);

  useLayoutEffect(() => {
    /*doWhenDocumentReadyStateIsComplete(() => {
      let wrap = document.querySelectorAll("#react-grid-layout-wrap");
      wrap &&
        setDimensions({
          width: wrap[0].offsetWidth,
          height: wrap[0].offsetHeight
        });
    });*/
    triggerWindowResize();
  }, []);

  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col
        id="react-grid-layout-wrap"
        lg={props.lg}
        md={props.md}
        sm={props.sm}
        xs={props.xs}
      >
        <div>
          <ResponsiveGridLayout
            className="layout"
            breakpoints={{
              lg: 1024,
              md: 996,
              sm: 768,
              xs: 480,
              xxs: 0,
            }}
            measureBeforeMount={true}
            cols={{ lg: 40, md: 10, sm: 8, xs: 4, xxs: 2 }}
            layouts={props.layouts}
            onLayoutChange={props.onChange}
            {...props}
          >
            {props.children}
          </ResponsiveGridLayout>
        </div>
      </Col>
    </Row>
  );
};

export default GridLayoutRow;
