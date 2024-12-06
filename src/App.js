import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Container from './js/Home/Bg';
import SignUp from './js/Home/Signup';
import Menu from './js/Home/Menu';
import OrderCart from './js/Home/Ordercart';
const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Container />}  />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='/order' element={<OrderCart />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
