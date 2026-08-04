import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HiBars3, HiXMark } from "react-icons/hi2";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "#home" },
    { name: "Courses", path: "#courses" },
    { name: "About", path: "#about" },
    { name: "Contact", path: "#contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img
            src={logo}
            alt="LMS Logo"
            className="h-20 w-auto object-contain"
          />
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="font-medium text-gray-700 hover:text-amber-500 transition-colors duration-300"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-5 py-2 rounded-lg border border-amber-600 text-amber-700 hover:bg-amber-100 transition"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="px-5 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            Register
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-3xl text-gray-700"
        >
          {menuOpen ? <HiXMark /> : <HiBars3 />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex flex-col px-6 py-5 space-y-4">

            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-amber-500 transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}

            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="border border-amber-500 text-amber-500 rounded-lg py-2 text-center hover:bg-amber-50 transition"
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="bg-amber-500 text-white rounded-lg py-2 text-center hover:bg-amber-600 transition"
            >
              Register
            </NavLink>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;