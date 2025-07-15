import React from "react";

const Footer = () => (
  <footer className="w-full py-6 bg-gray-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 text-center text-gray-500 dark:text-gray-400 text-sm mt-auto">
    &copy; {new Date().getFullYear()} WorkUp. All rights reserved.
  </footer>
);

export default Footer; 