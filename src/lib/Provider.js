import React from "react";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as ReduxProvider } from "react-redux";
import store, { persistor } from "lib/store";
// import ThemeProvider from 'lib/ThemeProvider';
import { ThemeContextProvider } from "components/contexts/ThemeContext";
import { GlobalStyle } from '../global_style';

import "react-toastify/dist/ReactToastify.css";

function Provider({ children }) {
  return (
    <ThemeContextProvider>
        <GlobalStyle/>
        <PersistGate loading={null} persistor={persistor}>
          <ReduxProvider store={store}>
            {children}
            <ToastContainer position="bottom-right" theme="colored" />
          </ReduxProvider>
        </PersistGate>
    </ThemeContextProvider>
  );
}

export default Provider;
