import 'App.css'
import AppRoutes from 'AppRoutes'
import React from 'react'
import Provider from 'lib/Provider'
import api from 'lib/api'

api.start()

class App extends React.Component {
  render() {
    return (
      <Provider>
        <AppRoutes />
      </Provider>
    )
  }
}

export default App 
