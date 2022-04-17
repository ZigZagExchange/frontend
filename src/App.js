import AppRoutes from "AppRoutes";
import React from "react";
import Provider from "lib/Provider";
import api from "lib/api";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "App.css";

api.start();
localStorage.setItem("tab_index", 0)
class App extends React.Component {
  render() {
    return (
      <Provider>
        <AppRoutes />
      </Provider>
    );
  }
}

export default App;
