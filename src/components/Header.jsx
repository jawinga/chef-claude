import logo from "../assets/iconChef.png";
import Toggle from "./Toggle";

export default function Header() {
  return (
    <header className="header-container">
      <img src={logo} alt="Logo" className="logoChef" />
      <h1 className="titleHeader">Chef AI</h1>
    </header>
  );
}
