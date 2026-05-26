import Image, { type ImageProps } from "next/image";

/** جودة عرض المنتجات — المصادر من واتساب/الشات غالباً ~600px عرضاً */
const PRODUCT_QUALITY = 95;

function isLocalProductSrc(src: ImageProps["src"]): boolean {
  return typeof src === "string" && src.startsWith("/products/");
}

type ProductImageProps = ImageProps & {
  /** تجنّب تكبير الصورة فوق دقتها الأصلية (أوضح في صفحة التفاصيل) */
  preserveSharpness?: boolean;
};

export function ProductImage({
  quality,
  unoptimized,
  sizes,
  className,
  preserveSharpness,
  ...props
}: ProductImageProps) {
  const local = isLocalProductSrc(props.src);

  return (
    <Image
      {...props}
      quality={quality ?? PRODUCT_QUALITY}
      unoptimized={unoptimized ?? local}
      sizes={
        sizes ??
        (preserveSharpness
          ? "(max-width: 768px) 90vw, 480px"
          : "(max-width: 768px) 45vw, 300px")
      }
      className={className}
    />
  );
}
