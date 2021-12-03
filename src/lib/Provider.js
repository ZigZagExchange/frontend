import React from 'react'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from '@xstyled/styled-components'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as ReduxProvider } from 'react-redux'
import theme from 'lib/theme'
import store, { persistor } from 'lib/store'

import 'react-toastify/dist/ReactToastify.css'

function Provider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
          <ToastContainer position="bottom-right" theme="colored" />
        </PersistGate>
      </ReduxProvider>
    </ThemeProvider>
  )
}

export default Provider