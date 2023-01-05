import Nav from "./nav";
import Prism from "prismjs";

const Layout = ({ children, categories, seo }) => (
  <>
    <Nav categories={categories} />
    {children}
  </>
);

export default Layout;