import React from "react";
import Link from "next/link";

const Nav = ({ categories }) => {
  return (
    <nav className="px-2 sm:px-4 py-2.5 rounded bg-gray-900">
      <div className="container flex mx-auto justify-between">
        <div className="logo">
          <Link href="/">devin sipal</Link>
        </div>

        <div className="w-full sm:block sm:w-auto" id="navbar-default">
          <ul className="flex list-none list-inside">
            {categories.map((category) => {
              return (
                <li key={category.id} className="mr-6">
                  <Link href={`/category/${category.attributes.slug}`}>
                    {category.attributes.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      
    </nav>
  );
};

export default Nav;
