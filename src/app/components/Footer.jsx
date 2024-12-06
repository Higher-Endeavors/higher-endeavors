const Footer = () => {
  return (
    <footer className="footer bg-root-chakra py-12 px-12 sm:text-m lg:text-xl text-[#C7DBFF]">
      <div className="flex flex-wrap gap-x-24">
        <ul>
          <li className="hover:text-[#CBAACB] pb-4"><a href="/about-us">About Us</a></li>
          <li className="hover:text-[#CBAACB]"><a href="/contact">Contact Us</a></li>
        </ul>
        <ul>
          <li className="hover:text-[#CBAACB]"><a href="/privacy-policy">Privacy Policy</a></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;