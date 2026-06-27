interface SceneBackgroundProps {
  src: string
  imageClass?: string
  overlayClass?: string
}

export default function SceneBackground({
  src,
  imageClass = 'opacity-60',
  overlayClass = 'bg-background/45',
}: SceneBackgroundProps) {
  return (
    <>
      <img
        src={src}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover ${imageClass}`}
        loading="lazy"
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </>
  )
}
