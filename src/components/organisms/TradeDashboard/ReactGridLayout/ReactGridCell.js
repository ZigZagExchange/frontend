import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

let detect = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    minX: 25, // min X swipe for horizontal swipe
    maxX: 30, // max X difference for vertical swipe
    minY: 25, // min Y swipe for vertial swipe
    maxY: 30, // max Y difference for horizontal swipe
  },
  direction = null;

export default class GridLayoutCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      headerID: this.props.headerID || "",
      headerClassName: this.props.headerClassName || "",
      headerLinesColor: this.props.headerLinesColor,
      headerLinesPadding: this.props.headerLinesPadding,
      headerFontSize: this.props.headerFontSize,
      headerHeight: this.props.headerHeight,
      headerTitle: this.props.headerTitle,
      headerBackgroundColor: this.props.headerBackgroundColor,
      headerBackgroundHoverColor: this.props.headerBackgroundHoverColor,
      contentBackgroundColor: this.props.contentBackgroundColor,
    };
  }

  componentDidMount() {
    let cellNode = this.getCellNode();
    let svgNode = cellNode.getElementsByTagName("svg");
    this.initCellHeader(cellNode);
    this.resizeSensor(cellNode, () => {
      let svgWidth = !svgNode[0]
        ? 0
        : svgNode[0].width
        ? svgNode[0].width.baseVal.value
        : 0;
      let svgHeight = !svgNode[0]
        ? 0
        : svgNode[0].height
        ? svgNode[0].height.baseVal.value
        : 0;
      let cellWidth = cellNode.clientWidth;
      let celHeight = cellNode.clientHeight;
      if (
        cellWidth - svgWidth < 0 ||
        celHeight - svgHeight < 0 ||
        cellWidth - svgWidth >= cellWidth * 0.1 ||
        celHeight - svgHeight >= celHeight * 0.1
      ) {
        let event = window.document.createEvent("UIEvents");
        event.initUIEvent("resize", true, false, window, 0);
        window.dispatchEvent(event);
      }
    });
  }

  resizeSensor(element, callback) {
    let zIndex = parseInt(getComputedStyle(element), 10);
    if (isNaN(zIndex)) {
      zIndex = 0;
    }
    zIndex--;

    let expand = document.createElement("div");
    expand.style.position = "absolute";
    expand.style.left = "0px";
    expand.style.top = "0px";
    expand.style.right = "0px";
    expand.style.bottom = "0px";
    expand.style.overflow = "hidden";
    expand.style.zIndex = zIndex;
    expand.style.visibility = "hidden";

    let expandChild = document.createElement("div");
    expandChild.style.position = "absolute";
    expandChild.style.left = "0px";
    expandChild.style.top = "0px";
    expandChild.style.width = "10000000px";
    expandChild.style.height = "10000000px";
    expand.appendChild(expandChild);

    let shrink = document.createElement("div");
    shrink.style.position = "absolute";
    shrink.style.left = "0px";
    shrink.style.top = "0px";
    shrink.style.right = "0px";
    shrink.style.bottom = "0px";
    shrink.style.overflow = "hidden";
    shrink.style.zIndex = zIndex;
    shrink.style.visibility = "hidden";

    let shrinkChild = document.createElement("div");
    shrinkChild.style.position = "absolute";
    shrinkChild.style.left = "0px";
    shrinkChild.style.top = "0px";
    shrinkChild.style.width = "200%";
    shrinkChild.style.height = "200%";
    shrink.appendChild(shrinkChild);

    element.appendChild(expand);
    element.appendChild(shrink);

    function setScroll() {
      expand.scrollLeft = 10000000;
      expand.scrollTop = 10000000;

      shrink.scrollLeft = 10000000;
      shrink.scrollTop = 10000000;
    }
    setScroll();

    let size = element.getBoundingClientRect();

    let currentWidth = size.width;
    let currentHeight = size.height;

    let onScroll = function () {
      let size = element.getBoundingClientRect();

      let newWidth = size.width;
      let newHeight = size.height;

      if (newWidth !== currentWidth || newHeight !== currentHeight) {
        currentWidth = newWidth;
        currentHeight = newHeight;

        callback();
      }

      setScroll();
    };

    expand.addEventListener("scroll", onScroll);
    shrink.addEventListener("scroll", onScroll);
  }

  initCellHeader(node) {
    //let offsets = this.getOuterOffsets(node);

    let header = node.getElementsByTagName("H2")[0];
    let content = node.getElementsByTagName("ARTICLE")[0];

    let headerOffsets = this.getOuterOffsets(header);

    let headerLinesColor = this.state.headerLinesColor;
    let headerLinesPadding = this.state.headerLinesPadding;
    let headerHeight = this.state.headerHeight;
    let headerFontSize = this.state.headerFontSize;

    let contentTop = this.state.headerHeight;

    let contentBackgroundColor = this.state.contentBackgroundColor;
    let headerBackgroundColor = this.state.headerBackgroundColor;
    let headerBackgroundHoverColor = this.state.headerBackgroundHoverColor;

    header.style.setProperty("--rgl-cell-color", headerLinesColor);
    header.style.setProperty("--rgl-cell-pad", headerLinesPadding);
    header.style.setProperty("--rgl-cell-header-height", headerHeight);
    content.style.setProperty("--rgl-cell-content-top", contentTop);
    header.style.setProperty("--rgl-cell-header-font-size", headerFontSize);
    header.style.setProperty(
      "--rgl-cell-header-background-hover-color",
      headerBackgroundHoverColor
    );
    header.style.setProperty(
      "--rgl-cell-header-background-color",
      headerBackgroundColor
    );
    content.style.setProperty(
      "--rgl-cell-background-color",
      contentBackgroundColor
    );
    content.style.setProperty(
      "--rgl-cell-content-height",
      "calc(100% - " + contentTop + "px)"
    );

    this.bindCellHeaderMouseEvent(node, headerOffsets);
    this.bindCellHeaderTouchEvent(node);
  }

  bindCellHeaderMouseEvent(node, offsets) {
    node.addEventListener("mousedown", (e) => {
      e.preventDefault();

      let el = e.target;

      if (this.isHeaderElement(el)) {
        // do nothing
      } else {
        e.cancelBubble = true;
      }
    });
  }

  bindCellHeaderTouchEvent(node) {
    node.addEventListener("touchstart", (e) => {
      let touch = e.touches[0];
      detect.startX = touch.screenX;
      detect.startY = touch.screenY;

      let el = e.target;

      if (this.isHeaderElement(el)) {
        // do nothing
      } else {
        e.cancelBubble = true;
      }
    });

    /*node.addEventListener("touchmove", e => {
      e.preventDefault();
      var touch = e.touches[0];
      detect.endX = touch.screenX;
      detect.endY = touch.screenY;
    });*/

    /*node.addEventListener("touchend", e => {
      if (
        // Horizontal move.
        Math.abs(detect.endX - detect.startX) > detect.minX &&
        Math.abs(detect.endY - detect.startY) < detect.maxY
      ) {
        direction = detect.endX > detect.startX ? "right" : "left";
      } else if (
        // Vertical move.
        Math.abs(detect.endY - detect.startY) > detect.minY &&
        Math.abs(detect.endX - detect.startX) < detect.maxX
      ) {
        direction = detect.endY > detect.startY ? "down" : "up";
      }

      if (direction !== null) {
        this.touchEventCallback(node, direction);
      }
    });*/
  }

  touchEventCallback(node, direction) {}

  isHeaderElement(el) {
    return !/content/i.test(el.tagName);
  }

  getOuterOffsets(node) {
    return { width: node.offsetWidth, height: node.offsetHeight };
  }

  getCellPosition(node) {
    var rect = node.getBoundingClientRect();
    return {
      x: Math.floor(rect.left + window.scrollX),
      y: Math.floor(rect.top + window.scrollY),
    };
  }

  getCellGutter(node, addenda = { padding: true, border: true, margin: true }) {
    var style = window.getComputedStyle(node);
    let elGutterWidth = addenda.padding
      ? parseFloat(style.paddingLeft)
      : 0 + addenda.padding
      ? parseFloat(style.paddingRight)
      : 0 + addenda.border
      ? parseFloat(style.borderLeft)
      : 0 + addenda.border
      ? parseFloat(style.borderRight)
      : 0 + addenda.margin
      ? parseFloat(style.marginLeft)
      : 0 + addenda.margin
      ? parseFloat(style.marginRight)
      : 0;
    let elGutterHeight = addenda.padding
      ? parseFloat(style.paddingTop)
      : 0 + addenda.padding
      ? parseFloat(style.paddingBottom)
      : 0 + addenda.border
      ? parseFloat(style.borderTop)
      : 0 + addenda.border
      ? parseFloat(style.borderBottom)
      : 0 + addenda.margin
      ? parseFloat(style.marginTop)
      : 0 + addenda.margin
      ? parseFloat(style.marginBottom)
      : 0;
    return { width: elGutterWidth, height: elGutterHeight };
  }

  getCellNode() {
    return ReactDOM.findDOMNode(this);
  }

  scrollDown(destination, duration = 200, easing = "linear", callback) {
    const easings = {
      linear(t) {
        return t;
      },
      easeInQuad(t) {
        return t * t;
      },
      easeOutQuad(t) {
        return t * (2 - t);
      },
      easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
      easeInCubic(t) {
        return t * t * t;
      },
      easeOutCubic(t) {
        return --t * t * t + 1;
      },
      easeInOutCubic(t) {
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      easeInQuart(t) {
        return t * t * t * t;
      },
      easeOutQuart(t) {
        return 1 - --t * t * t * t;
      },
      easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
      },
      easeInQuint(t) {
        return t * t * t * t * t;
      },
      easeOutQuint(t) {
        return 1 + --t * t * t * t * t;
      },
      easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
      },
    };

    const start = window.pageYOffset;
    const startTime =
      "now" in window.performance ? performance.now() : new Date().getTime();

    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.getElementsByTagName("body")[0].clientHeight;
    const destinationOffset =
      typeof destination === "number" ? destination : destination.offsetTop;
    const destinationOffsetToScroll = Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    );

    if ("requestAnimationFrame" in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) {
        callback();
      }
      return;
    }

    function scroll() {
      const now =
        "now" in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, (now - startTime) / duration);
      const timeFunction = easings[easing](time);
      window.scroll(
        0,
        Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start)
      );

      if (window.pageYOffset === destinationOffsetToScroll) {
        if (callback) {
          callback();
        }
        return;
      }

      requestAnimationFrame(scroll);
    }

    scroll();
  }

  handleGridCellSizing(sizing) {
    const { minW, maxW, minH, maxH } = sizing;
    this.setState({
      minW: minW,
      maxW: maxW,
      minH: minH,
      maxH: maxH,
    });
  }

  render() {
    return (
      <section style={{ width: "100%", height: "100%" }}>
        <Header
          title="Drag clicking or tapping to reposition this window"
          id={this.state.headerID}
          className={this.state.headerClassName}
        >
          {this.state.headerTitle}
          <div className="rgl-arrows-outer">
            <div className="rgl-arrows-middle rgl-arrows-horizontal">
              <span className="rgl-arrow-container">
                <span className="rgl-head-arrow" />
              </span>
              <span className="rgl-south-arrow-container">
                <span className="rgl-head-arrow" />
              </span>
            </div>
            <div className="rgl-arrows-middle rgl-arrows-vertical">
              <span className="rgl-arrow-container">
                <span className="rgl-head-arrow" />
              </span>
              <span className="rgl-south-arrow-container">
                <span className="rgl-head-arrow" />
              </span>
            </div>
          </div>
        </Header>
        <Content>{this.props.children}</Content>
      </section>
    );
  }
}

const Content = styled.article`
  position: absolute;
  display: block;
  left: 0;
  top: var(--rgl-cell-content-top, 10px);
  width: 100%;
  height: calc(100% - var(--rgl-cell-content-top, 10px));
  background-color: var(--rgl-cell-background-color, #fff);
`;

const Header = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-weight: 550;
  height: var(--rgl-cell-header-height, 10px);
  text-align: center;
  font-size: var(--rgl-cell-header-font-size, 12px);
  text-shadow: 0 1px 0 rgba(255, 250, 250, 0.5);
  cursor: move;
  border-bottom: 1px solid var(--rgl-cell-color, #ccc);
  background-color: var(--rgl-cell-header-background-color, #fafafa);
  user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
  &:hover {
    background-color: var(--rgl-cell-header-background-hover-color, #fafafa);
  }
  & .rgl-arrows-outer {
    padding: 0 0.33rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .rgl-east-arrow-container {
    display: inline-block;
    line-height: 12px;
    padding: 3px 0;
    width: 4px;
  }
  & .rgl-arrows-horizontal {
    transform: rotate(90deg);
  }
  & .rgl-arrows-vertical {
    transform: translate(-18px);
  }
  & .rgl-arrows-middle {
    display: block;
    width: 18px;
  }
  & .rgl-arrow-container {
    display: block;
    line-height: 18px;
    margin-bottom: 5px;
    transform: rotate(-90deg);
  }
  & .rgl-south-arrow-container {
    display: block;
    line-height: 18px;
    transform: rotate(90deg);
  }
  & .rgl-head-arrow {
    background: #000;
    height: 1px;
    width: 9px;
    margin: 0 auto;
    position: relative;
    display: block;
  }
  & .rgl-head-arrow:before,
  & .rgl-head-arrow:after {
    content: "";
    background: #000;
    position: absolute;
    height: 1px;
    width: 5px;
  }
  & .rgl-head-arrow:before {
    right: -2px;
    bottom: -2px;
    transform: rotate(-45deg);
  }
  & .rgl-head-arrow:after {
    right: -2px;
    top: -2px;
    transform: rotate(45deg);
  }
  &:before {
    content: "";
    flex: 1;
    width: 100%;
    height: 2px;
    height: 4px;
    border-top: 1px solid var(--rgl-cell-color, #ccc);
    border-bottom: 1px solid var(--rgl-cell-color, #ccc);
    margin-right: var(--rgl-cell-pad, 1rem);
  }
  &:after {
    content: "";
    flex: 1;
    width: 100%;
    height: 2px;
    height: 4px;
    border-top: 1px solid var(--rgl-cell-color, #ccc);
    border-bottom: 1px solid var(--rgl-cell-color, #ccc);
    margin-left: var(--rgl-cell-pad, 1rem);
  }
`;
