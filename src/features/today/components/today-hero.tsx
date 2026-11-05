import { useSyncExternalStore } from "react";

function greetingFor(hour: number) {
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

// A clock store that ticks each minute; one Date per tick so snapshots compare equal.
let minute: Date | null = null;
function subscribeClock(onTick: () => void) {
  const timer = setInterval(() => {
    minute = new Date();
    onTick();
  }, 60_000);
  return () => clearInterval(timer);
}
function readClock() {
  minute ??= new Date();
  return minute;
}

/**
 * The person's clock. The server doesn't know their time zone, so the server
 * render (and hydration) greets without a time of day.
 */
function useNow(): Date | null {
  return useSyncExternalStore(subscribeClock, readClock, () => null);
}

/** The hero at the top of a space's home: a quiet landscape and the greeting. */
export function TodayHero({ name }: { name: string | undefined }) {
  const now = useNow();
  const firstName = name?.trim().split(/\s+/)[0];
  const greeting = now ? greetingFor(now.getHours()) : "Hello";

  return (
    <figure className="today__hero">
      <Scene />
      <figcaption className="today__caption">
        <span className="today__greeting">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </span>
        <span className="today__date">{now ? dateFormat.format(now) : " "}</span>
      </figcaption>
    </figure>
  );
}

/** Still lake, early light. Colors come from the --scene-* tokens, so it follows the theme. */
function Scene() {
  return (
    <svg
      className="scene"
      viewBox="0 0 800 340"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect className="scene__sky" width="800" height="340" />
      <circle className="scene__sun" cx="560" cy="120" r="38" />
      <path
        className="scene__hill-far"
        d="M0 200 C120 150 220 170 320 190 S520 140 640 170 S760 190 800 180 V340 H0Z"
      />
      <path
        className="scene__hill-near"
        d="M0 240 C140 200 260 225 380 235 S600 200 800 228 V340 H0Z"
      />
      <path className="scene__water" d="M0 270 H800 V340 H0Z" />
      <path
        className="scene__glint"
        d="M120 292h140M420 304h200M300 318h90M560 288h120"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
