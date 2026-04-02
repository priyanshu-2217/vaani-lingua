interface Props {
  data: number[];
  isActive: boolean;
}

export default function WaveformVisualizer({ data, isActive }: Props) {
  return (
    <div className="flex h-24 items-end justify-center gap-[2px] rounded-xl bg-muted/50 px-4 py-2">
      {data.map((value, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-100"
          style={{
            height: `${Math.max(4, isActive ? (value / 255) * 80 : 4)}px`,
            backgroundColor: isActive
              ? `hsl(245, 58%, ${51 + (value / 255) * 20}%)`
              : "hsl(var(--muted-foreground) / 0.3)",
          }}
        />
      ))}
    </div>
  );
}
