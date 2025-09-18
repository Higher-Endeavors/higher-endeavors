// src/components/Header.js

// public
import Image from "next/image";
import Logo from "../../public/Logo.js";
import DropdownMenu from "./DropdownMenu";

const Header = () => {
  return (
    <header className="px-20 py-4 flex flex-col md:flex-row sm:flex-row justify-between">
      <div>
        <a href="/">
          <Logo className="w-full h-auto max-w-[400px] md:max-w-[400px] lg:max-w-[400px]" />
        </a>
      </div>
      <div className="space-x-8 flex pt-3">
        <DropdownMenu />
        <a href="https://www.instagram.com/higherendeavors/" target="_blank">
          <svg
            className="w-[40px] h-[40px] text-gray-800 dark:text-white hover:text-[#CBAACB]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
        <a href="https://www.facebook.com/higherendeavors" target="_blank">
          <svg
            className="w-[40px] h-[40px] text-gray-800 dark:text-white hover:text-[#CBAACB]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
        <a href="https://x.com/higherendeavors" target="_blank">
          <svg
            className="w-[40px] h-[40px] text-gray-800 dark:text-white hover:text-[#CBAACB]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z" />
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
