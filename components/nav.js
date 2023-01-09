import React from "react";
import Link from "next/link";
import Switch from "../components/darkSwitch"

const Nav = ({ categories }) => {
  return (
    <nav className="px-2 sm:px-6 lg:px-8 py-2.5 bg-white dark:bg-gray-900">
      <div className="flex flex-row flex-wrap mx-auto justify-between text-lg font-bold max-w-7xl">
        <div className="logo">
          <Link href="/" className="text-black dark:text-white">devin sipal</Link>
        </div>

        <div className="sm:w-auto" id="navbar-default">
          <ul className="inline-flex list-none list-inside">
            {categories.map((category) => {
              return (
                <li key={category.id} className="mr-6 text-black dark:text-white">
                  <Link href={`/category/${category.attributes.slug}`}>
                    {category.attributes.title}
                  </Link>
                </li>
              );
            })}
            <li>
              <Switch />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
