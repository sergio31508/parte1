import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Registro from "./Registro";
import Admin from "./Admin";
import Catalogo from "./Catalogo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
