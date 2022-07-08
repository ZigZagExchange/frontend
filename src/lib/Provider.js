import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as ReduxProvider } from "react-redux";
import store, { persistor } from "lib/store";
// import ThemeProvider from 'lib/ThemeProvider';
import { ThemeContextProvider } from "components/contexts/ThemeContext";
import { GlobalStyle } from "../global_style";
import ModalContext from "components/contexts/ModalContext";

import "react-toastify/dist/ReactToastify.css";

function Provider({ children }) {
  const isMobile = window.innerWidth < 500;
  return (
    <ThemeContextProvider>
      <GlobalStyle />
      <PersistGate loading={null} persistor={persistor}>
        <ReduxProvider store={store}>
          <ModalContext>{children}</ModalContext>
          <ToastContainer
            position="bottom-right"
            theme="colored"
            style={{ width: isMobile ? "100%" : "400px" }}
          />
        </ReduxProvider>
      </PersistGate>
    </ThemeContextProvider>
  );
}

export default Provider;
