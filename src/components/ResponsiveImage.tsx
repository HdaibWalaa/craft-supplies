import type { ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; fill?: boolean; priority?: boolean };
export default function ResponsiveImage({ fill, priority, className, ...props }: Props) {
  return <img {...props} className={`${fill ? "absolute inset-0 h-full w-full " : ""}${className ?? ""}`} loading={priority ? "eager" : props.loading ?? "lazy"} fetchPriority={priority ? "high" : props.fetchPriority} />;
}
