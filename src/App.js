import "./App.css";
import AppRoute from "./routes/AppRoute"
import AuthContextProvider from "./context/authContext";
import React from 'react'


class App extends React.Component {
    componentDidMount() {
        document.title = "Zigzag";
    }

    render() {
        return (
            <>
                <AuthContextProvider>
                    <AppRoute/>
                </AuthContextProvider>
            </>
        );
    }
}

export default App;
