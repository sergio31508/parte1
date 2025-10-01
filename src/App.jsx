import { useState } from 'react';
import Login from './Login.jsx';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn ? <h1>Bienvenido al sistema</h1> : <Login onLogin={() => setIsLoggedIn(true)} />}
    </div>
  );
}

export default App;
