import React from "react"

class Draggable extends React.Component {
    constructor(props, children) {
        super(props);

        this.children = children;
        this.state = {
            // initial position
            pos: props.initialPos || {x: 0, y: 0},
            dragging: false,
            rel: null
        }

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    componentDidUpdate(props, state) {
      if (this.state.dragging && !state.dragging) {
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      } else if (!this.state.dragging && state.dragging) {
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      }
    }

    onMouseDown(e){
      // only left mouse button
      if (e.button !== 0) return
      var pos = {top: e.pageY, left: e.pageX};
      this.setState({
        dragging: true,
        rel: {
          x: pos.left  - this.state.pos.x,
          y: pos.top - this.state.pos.y,
        }
      })
      e.stopPropagation()
      e.preventDefault()
    }

    onMouseUp(e) {      
      this.setState({dragging: false})
      e.stopPropagation()
      e.preventDefault()
    }

    onMouseMove(e) {

      if (!this.state.dragging) return
      this.setState({
        pos: {
          x: e.pageX - this.state.rel.x,
          y: e.pageY - this.state.rel.y
        }
      })
      e.stopPropagation()
      e.preventDefault()
    }

    render() {
        const children = this.props.children;
        return (<div
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            onMouseUp={this.onMouseUp}
        >
            {React.cloneElement(React.Children.only(children), {
                className: 'dragger',
                style: {
                    zIndex: 99,
                    top: this.state.pos.y + "px",
                    left: this.state.pos.x + "px",

                    width: '100%'
                },
            })}
        </div>
         )
    }
  }

  export default Draggable;
