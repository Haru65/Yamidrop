import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/login';
import Home from './components/home/home';
import './App.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
        <ToastContainer position='top-right' autoClose={3000}/>
    </Router>
  );
}

export default App;
