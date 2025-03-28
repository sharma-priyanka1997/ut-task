import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { CompanyProvider } from './context/CompanyContext';

function App() {
  return (
    <CompanyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company/:name" element={<Detail />} />
        </Routes>
      </Router>
    </CompanyProvider>
  );
}

export default App;