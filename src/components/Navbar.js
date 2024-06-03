import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      {/*<a href="/" className="site-title"> */}
      <Link to="/" className="site-title">
        VIS-tool
      </Link>
      <ul>
        <CustomLink to="/graph">Graph</CustomLink>
        <CustomLink to="/stats1">Statistics</CustomLink>
        <CustomLink to="/stats2">More Stats</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)  // converts each path to absolute path
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })  // end: true  the entire path must match
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}