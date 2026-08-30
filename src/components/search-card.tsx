import { applyBasePath } from "@/lib/utils";

interface SearchCardProps {
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  /** 图标底色样式,默认 primary 灰蓝;可传 destructive 系覆盖为红色系 */
  iconClassName?: string;
  imageHeight?: string;
  hideWatermark?: boolean;
}

export default function SearchCard({
  title,
  description,
  image,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  imageHeight = "h-40",
  hideWatermark = false,
}: SearchCardProps) {
  const resolvedImageSrc = applyBasePath(image);

  return (
    <div className="flex flex-col items-center">
      <div className="group relative flex h-72 w-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-muted/50">
        {/* Title with Icon */}
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-bold tracking-wide text-foreground uppercase">
            {title}
          </h3>
        </div>

        {/* Illustration - 统一高度容器，底部对齐 */}
        <div className="flex flex-1 items-end justify-center pb-2">
          <div className={`${imageHeight} w-full flex items-end justify-center relative`}>
            <img
              src={resolvedImageSrc}
              alt=""
              className="h-full w-auto object-contain"
              title=""
            />
            {/* Watermark Mask - 更小范围，更柔和 */}
            {hideWatermark && (
              <div className="absolute bottom-0 right-0 h-10 w-16 bg-gradient-to-tl from-card via-card/90 to-transparent" />
            )}
          </div>
        </div>
      </div>

      {/* Description below card */}
      <p className="mt-4 text-sm text-muted-foreground text-center">
        {description}
      </p>
    </div>
  );
}
