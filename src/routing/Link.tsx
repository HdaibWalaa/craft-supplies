import { Link as RouterLink, type LinkProps } from "react-router-dom";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & Omit<LinkProps, "to"> & { href: string; children?: ReactNode };
export default function Link({ href, ...props }: Props) { return <RouterLink to={href} {...props} />; }
