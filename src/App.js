import AppRoutes from 'AppRoutes'
import React from 'react'
import Provider from 'lib/Provider'
import api from 'lib/api'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import 'App.css'
import * as Sentry from "@sentry/react"
import {BrowserTracing} from "@sentry/tracing"
import {isProduction} from "./lib/helpers/env";

api.start()

if (isProduction()) {
  Sentry.init({
    dsn: "https://6438a6fc06ae48ac94f3f3046b04199b@o1147437.ingest.sentry.io/6217691",
    integrations: [new BrowserTracing()],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

class App extends React.Component {
  render() {
    return (
      <Provider>
        <AppRoutes />
      </Provider>
    )
  }
}

export default App; 
