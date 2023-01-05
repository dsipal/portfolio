import React from "react";
import Link from "next/link";

const Nav = ({ categories }) => {
  return (
    <div>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
        <div className="container flex flex-wrap items-center justify-between mx-auto">
          <div className="logo">
              <Link href="/">
                devin sipal
              </Link>
          </div>
        </div>
        <div className="w-full md:block md:w-auto" id="navbar-default">
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
      </nav>
    </div>
  );
};

export default Nav;