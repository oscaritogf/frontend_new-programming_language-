// src/components/Layout/Header.tsx
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full flex items-center px-6 py-4 shadow-md bg-gray-300">
      <Link href="/">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={30}
          height={15}
          priority
        />
      </Link>
    </header>
  );
};

export default Header;
