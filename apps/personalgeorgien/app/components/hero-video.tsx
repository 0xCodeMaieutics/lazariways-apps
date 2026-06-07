export function HeroVideo() {
  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-primary/10">
      <video
        className="h-full w-full object-cover"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Fachkräfte aus Georgien"
      />
    </div>
  )
}
