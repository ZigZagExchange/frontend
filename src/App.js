import AppRoutes from "AppRoutes";
import React, { useEffect } from "react";
import Provider from "lib/Provider";
import api from "lib/api";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "App.css";

api.start();

export default function App() {
    useEffect(() => {}, []);

    return (
        <Provider>
            <AppRoutes />
        </Provider>
    );
}
