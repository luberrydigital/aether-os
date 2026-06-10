import Image from "next/image";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className, priority }: Props) {
  const url = (src?.trim() || "/placeholder-product.svg").replace(/^http:\/\//i, "https://");
  const isRemote = url.startsWith("https://");

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className={className}
      priority={priority}
      unoptimized={isRemote}
    />
  );
}
