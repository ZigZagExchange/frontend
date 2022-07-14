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
        xl={props.xl}
        lg={props.lg}
        md={props.md}
        xxs={props.xxs}
      >
        <div>
          <ResponsiveGridLayout
            className="layout"
            breakpoints={{
              xl: 1599,
              lg: 1199,
              md: 991,
              xxs: 0,
            }}
            measureBeforeMount={true}
            cols={{ xl: 40, lg: 40, md: 40, xxs: 40 }}
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
