import { FaFacebook, FaInstagram, FaTwitter, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function DemoHeader({
  logoSrc,
  logoAlt,
  navLinks,
  socialLinks,
  fontClass = 'font-sans',
  // Receive custom colors as hex values
  customBgColor = '#ffffff',
  customTextColor = '#000000',
  hoverColor = 'hover:text-blue-600',
  underlineStyle = 'hover:underline'
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use the custom hex value as an inline style for the header background.
  const headerStyle = { backgroundColor: customBgColor };

  // Inline style for text. Note that this overrides Tailwind classes.
  const textStyle = { color: customTextColor };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={headerStyle}>
      {/* Navbar */}
      <nav style={headerStyle} className="relative flex items-center justify-between px-4 md:px-8 py-6 shadow-md min-h-[110px]">
        {/* Left Spacer */}
        <div className="w-16 md:w-32" />

        {/* Center: Logo and Navigation Links (Desktop) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-[90%] flex items-center justify-between sm:flex-row sm:justify-center sm:space-x-10">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="w-20 sm:w-28 h-20 sm:h-24 rounded"
            />
          </div>

          {/* Navigation Links for Desktop */}
          <div className={`hidden sm:flex sm:space-x-6 text-lg ${fontClass}`}>
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                style={textStyle}
                className={`${hoverColor} ${underlineStyle} transition-colors`}
              >
                {link.text}
              </a>
            ))}
          </div>

          {/* Social Media Icons */}
          <div className="hidden sm:flex space-x-6">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} style={textStyle} className={hoverColor}>
                <FaFacebook size={24} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} style={textStyle} className={hoverColor}>
                <FaInstagram size={24} />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} style={textStyle} className={hoverColor}>
                <FaTwitter size={24} />
              </a>
            )}
          </div>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="sm:hidden flex items-center absolute right-4">
          <button onClick={toggleMenu} style={textStyle} className="text-3xl">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-40 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden`}
        style={{ backgroundColor: customBgColor }}
        onClick={toggleMenu}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed right-0 top-0 w-full h-full shadow-md z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden`}
        style={{ backgroundColor: customBgColor }}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleMenu} style={textStyle} className="text-3xl">
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col items-center space-y-6">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              style={textStyle}
              className={`w-full text-center py-4 border-b border-gray-300 ${hoverColor} ${underlineStyle}`}
            >
              {link.text}
            </a>
          ))}
          {/* Mobile Social Media Icons */}
          <div className="flex space-x-6">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} style={textStyle} className={hoverColor}>
                <FaFacebook size={24} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} style={textStyle} className={hoverColor}>
                <FaInstagram size={24} />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} style={textStyle} className={hoverColor}>
                <FaTwitter size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
