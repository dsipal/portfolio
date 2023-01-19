import Nav from "./nav";
import Prism from "prismjs";
import Footer from './footer';

const Layout = ({ children, categories, seo }) => (
  <>
    <Nav categories={categories} />
    {children}
    <Footer></Footer>
  </>
);

export default Layout;
