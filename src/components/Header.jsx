import logo from "../assets/iconChef.png";

export default function Header() {
  return (
    <header className="header-container">
      <img src={logo} alt="Logo" className="logoChef" />
      <h1 className="titleHeader">Chef Claude</h1>
    </header>
  );
}
