import React, { Component } from "react";

import SizeMe from "react-sizeme";

const WidthProvider = (ComposedComponent) =>
  class extends Component {
    constructor(props) {
      super(props);

      this.state = { width: this.props.size.width };
      //this.state.height = this.props.size.height;
    }

    //componentWillMount() {
    //}

    //componentWillReceiveProps(nextProps) {
    //  this.setState({
    //    width: nextProps.size.width
    //height: nextProps.size.height
    //  });
    //}

    static getDerivedStateFromProps(nextProps, prevState) {
      return {
        width: ~~nextProps.size.width /*, height: nextProps.size.height */,
      };
    }

    render() {
      return <ComposedComponent {...this.props} {...this.state} />;
    }
  };

export default (ComposedComponent) =>
  SizeMe({
    monitorWidth: true,
    //monitorHeight: true
  })(WidthProvider(ComposedComponent));
