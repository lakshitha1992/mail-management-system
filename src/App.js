import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <ThemeProvider>
        <BrowserRouter>
          <main className="flex-grow">
            <Routes>
           
              <Route path="/" element={<Home />} />
      
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add more routes here as your app grows */}
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
