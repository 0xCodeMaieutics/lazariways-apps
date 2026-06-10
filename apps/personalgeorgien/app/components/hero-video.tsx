export function HeroVideo() {
  return (
    <div className="relative h-full min-h-[28rem] w-full overflow-hidden bg-primary/10 lg:min-h-0">
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
