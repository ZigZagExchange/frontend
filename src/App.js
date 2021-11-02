import "./App.css";
import AppRoute from "./routes/AppRoute"
import React from 'react';



class App extends React.Component {
    componentDidMount() {
        document.title = "Zigzag";
    }

    render() {
        return (
            <>
                <AppRoute/>
            </>
        );
    }
}

export default App;
