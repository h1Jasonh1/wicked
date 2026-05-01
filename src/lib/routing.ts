export function isActivePath(pathname: string, href: string) {
  if (href.includes("?")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
