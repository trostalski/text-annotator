import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-primary/80 text-primary-foreground p-2">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-semibold">Text Annotator</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:underline">
                Documentation
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
