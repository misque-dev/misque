export function TrafficLightsIcon(
  props: React.ComponentPropsWithoutRef<'svg'>
) {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 10" fill="none" {...props}>
      <circle cx="5" cy="5" r="4.5" fill="#ef4444" />
      <circle cx="21" cy="5" r="4.5" fill="#10b981" />
      <circle cx="37" cy="5" r="4.5" fill="#f59e0b" />
    </svg>
  );
}
