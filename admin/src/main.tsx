import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import store from './app/store.ts'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom';
import Router1 from './routes/index.tsx'
import ThemeProvider from './theme';
import ThemeLocalization from './components/ThemeLocalization.tsx'
import ThemeColorPresets from './components/ThemeColorPresets.tsx'
import RtlLayout from './components/RtlLayout.tsx'
import MotionLazyContainer from './components/animate/MotionLazyContainer.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <ThemeProvider themeDirection={undefined}>
    <ThemeColorPresets>
    <ThemeLocalization>
    <RtlLayout>
    <MotionLazyContainer>
      <Router>
      <Provider store={store}>
          {/* <App /> */}
            <Router1/>
          
        </Provider> 
       
       </Router>
      </MotionLazyContainer>
      </RtlLayout>
      </ThemeLocalization>
      </ThemeColorPresets>
    </ThemeProvider>
  </React.StrictMode>,
)
