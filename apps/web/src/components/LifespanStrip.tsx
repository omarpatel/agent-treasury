import type { AgentStatus } from '@agent-treasury/shared';

const LIGHTS = 12;
const DAYS_PER_LIGHT = 2.5;

interface LifespanStripProps {
  lifespanDays: number | null;
  status: AgentStatus;
  size?: 'sm' | 'lg';
  /** Used for the "DIED D+{age}" label on dead agents. */
  ageDays?: number;
  className?: string;
}

export type LifespanTone = 'green' | 'amber' | 'red';

/** >14d green, 3–14d amber, <3d red (D31). */
export function lifespanTone(lifespanDays: number | null): LifespanTone {
  if (lifespanDays === null || lifespanDays > 14) return 'green';
  if (lifespanDays >= 3) return 'amber';
  return 'red';
}

/** 12 lights × 2.5 days; exact contract from AMENDMENTS D31. */
export function LifespanStrip({ lifespanDays, status, size, ageDays, className }: LifespanStripProps) {
  const cls = ['rw-strip', size ?? '', className ?? ''].filter(Boolean).join(' ');
  const dead = status === 'dead';
  const lit = dead ? LIGHTS : lifespanDays === null ? LIGHTS : Math.min(LIGHTS, Math.max(1, Math.ceil(lifespanDays / DAYS_PER_LIGHT)));
  const lightClass = dead ? 'end-dead' : `on-${lifespanTone(lifespanDays)}`;

  return (
    <span className={cls}>
      <span className="rw-lights">
        {Array.from({ length: LIGHTS }, (_, i) => (
          <i key={i} className={i < lit ? lightClass : undefined} />
        ))}
      </span>
      <span className="rw-days">
        {dead ? (
          `DIED D+${Math.max(0, Math.floor(ageDays ?? 0))}`
        ) : lifespanDays === null ? (
          '∞'
        ) : (
          <>
            <b>{lifespanDays.toFixed(1)}</b>d
          </>
        )}
      </span>
    </span>
  );
}
