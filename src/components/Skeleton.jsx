// ── Skeleton Screen Components ──────────────────────────────────────────
// Light-theme skeletons with a GPU-friendly sweep highlight (transform on a
// pseudo-element instead of animating background-position) and a staggered
// fade-in so blocks settle in sequence rather than popping all at once.

const bg = "#F5F4F2";
const CARD_BG = "#FFFFFF";
const CARD_LINE = "#E7E5E0";
const BONE = "#EFEDE8";

const shimmerStyle = `
  @keyframes sk-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  @keyframes sk-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .sk {
    position: relative; overflow: hidden; background: ${BONE};
  }
  .sk::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.75) 50%, transparent 100%);
    transform: translateX(-100%);
    animation: sk-sweep 1.5s cubic-bezier(.4,0,.2,1) infinite;
  }
  .sk-in { animation: sk-in .55s cubic-bezier(.22,1,.36,1) both; }
  .sk-shell-side { display: flex; }
  .sk-shell-main { margin-left: 220px; }
  @media (max-width: 768px) {
    .sk-shell-side { display: none !important; }
    .sk-shell-main { margin-left: 0 !important; padding: 70px 12px 80px !important; }
    .sk-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .sk-two { grid-template-columns: 1fr !important; }
    .sk-hide-sm { display: none !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sk::after { animation: none; }
    .sk-in { animation: none; }
  }
`;

export function SkeletonStyles() {
  return <style>{shimmerStyle}</style>;
}

function Sk({ w = "100%", h = 14, r = 8, style = {} }) {
  return (
    <div className="sk" aria-hidden="true" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

// Wrapper that fades a block in with a delay based on its index.
function Stagger({ i = 0, step = 0.06, style, children }) {
  return <div className="sk-in" style={{ animationDelay: `${i * step}s`, ...style }}>{children}</div>;
}

const cardBox = { background: CARD_BG, border: `1px solid ${CARD_LINE}` };

function StatCardSkeleton() {
  return (
    <div style={{ ...cardBox, borderRadius: 18, padding: 24, position: "relative", overflow: "hidden" }}>
      <Sk w={80} h={10} style={{ marginBottom: 16 }} />
      <Sk w={130} h={32} r={10} style={{ marginBottom: 12 }} />
      <Sk w={90} h={10} />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr style={{ borderBottom: `1px solid ${CARD_LINE}` }}>
      <td style={{ padding: "20px 18px" }}>
        <Sk w={180} h={14} style={{ marginBottom: 8, maxWidth: "100%" }} />
        <Sk w={110} h={10} />
      </td>
      <td style={{ padding: "20px 18px" }}><Sk w={60} h={10} /></td>
      <td className="sk-hide-sm" style={{ padding: "20px 18px" }}><Sk w={76} h={22} r={100} /></td>
      <td style={{ padding: "20px 18px" }}><Sk w={80} h={14} /></td>
      <td className="sk-hide-sm" style={{ padding: "20px 18px" }}><Sk w={90} h={10} /></td>
      <td className="sk-hide-sm" style={{ padding: "20px 18px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Sk w={72} h={30} r={10} />
          <Sk w={60} h={30} r={10} />
        </div>
      </td>
    </tr>
  );
}

function ClientCardSkeleton() {
  return (
    <div style={{ ...cardBox, borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <Sk w={44} h={44} r={12} />
      <div style={{ flex: 1 }}>
        <Sk w={130} h={14} style={{ marginBottom: 8 }} />
        <Sk w={180} h={10} style={{ maxWidth: "100%" }} />
      </div>
      <div style={{ textAlign: "right" }}>
        <Sk w={80} h={14} style={{ marginBottom: 8 }} />
        <Sk w={60} h={10} />
      </div>
    </div>
  );
}

function ESignCardSkeleton() {
  return (
    <div style={{ ...cardBox, borderRadius: 18, padding: 22, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Sk w={220} h={15} style={{ marginBottom: 8, maxWidth: "100%" }} />
          <Sk w={140} h={10} />
        </div>
        <Sk w={100} h={26} r={100} />
      </div>
      <Sk w="100%" h={4} r={100} style={{ marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 10 }}>
        <Sk w={130} h={32} r={10} />
        <Sk w={100} h={32} r={10} style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
}

function DashboardBody() {
  return (
    <>
      <Stagger i={0} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <Sk w={300} h={32} r={10} style={{ marginBottom: 12, maxWidth: "70vw" }} />
          <Sk w={200} h={13} />
        </div>
        <Sk w={150} h={42} r={14} />
      </Stagger>

      <div className="sk-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => <Stagger key={i} i={i + 1}><StatCardSkeleton /></Stagger>)}
      </div>

      <Stagger i={5} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <Sk w={160} h={22} r={8} />
        <Sk w={280} h={38} r={12} style={{ maxWidth: "50%" }} />
      </Stagger>

      <Stagger i={6} style={{ ...cardBox, borderRadius: 20, overflow: "hidden", marginBottom: 28 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${CARD_LINE}` }}>
              {[80, 50, 60, 60, 50, 70].map((w, i) => (
                <th key={i} className={i === 2 || i > 3 ? "sk-hide-sm" : undefined} style={{ padding: "16px 18px", textAlign: "left" }}>
                  <Sk w={w} h={10} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)}
          </tbody>
        </table>
      </Stagger>

      <div className="sk-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[0, 1].map(j => (
          <Stagger key={j} i={7 + j} style={{ ...cardBox, borderRadius: 20, padding: 24 }}>
            <Sk w={170} h={20} style={{ marginBottom: 22 }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 14, borderBottom: `1px solid ${CARD_LINE}`, marginBottom: 14 }}>
                <Sk w={36} h={36} r={10} />
                <div style={{ flex: 1 }}>
                  <Sk w="80%" h={12} style={{ marginBottom: 8 }} />
                  <Sk w={70} h={10} />
                </div>
              </div>
            ))}
          </Stagger>
        ))}
      </div>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <DashboardBody />
    </>
  );
}

// Full workspace shell (sidebar + dashboard body) shown while the Dashboard
// fetches profile/documents/clients on first load.
export function DashboardShellSkeleton() {
  return (
    <div role="status" aria-label="Loading workspace" style={{ minHeight: "100vh", background: bg, display: "flex" }}>
      <style>{shimmerStyle}</style>
      <aside className="sk-shell-side" style={{ width: 220, position: "fixed", height: "100vh", flexDirection: "column", padding: "24px 0", background: CARD_BG, borderRight: `1px solid ${CARD_LINE}` }}>
        <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${CARD_LINE}`, marginBottom: 16 }}>
          <Sk w={110} h={18} style={{ marginBottom: 8 }} />
          <Sk w={80} h={8} />
        </div>
        <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${CARD_LINE}`, marginBottom: 14 }}>
          <Sk w={36} h={36} r={14} />
          <div style={{ flex: 1 }}>
            <Sk w="70%" h={12} style={{ marginBottom: 6 }} />
            <Sk w="45%" h={8} />
          </div>
        </div>
        {[...Array(8)].map((_, i) => (
          <Stagger key={i} i={i} step={0.04} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px" }}>
            <Sk w={18} h={18} r={6} />
            <Sk w={[90, 80, 84, 56, 72, 64, 78, 66][i]} h={11} />
          </Stagger>
        ))}
        <div style={{ marginTop: "auto", padding: "0 16px" }}>
          <Sk w="100%" h={56} r={14} style={{ marginBottom: 10 }} />
          <Sk w="100%" h={38} r={12} />
        </div>
      </aside>
      <main className="sk-shell-main" style={{ flex: 1, padding: 32, minWidth: 0 }}>
        <DashboardBody />
      </main>
    </div>
  );
}

export function ClientsSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(5)].map((_, i) => <Stagger key={i} i={i}><ClientCardSkeleton /></Stagger>)}
    </>
  );
}

export function ESignSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(3)].map((_, i) => <Stagger key={i} i={i}><ESignCardSkeleton /></Stagger>)}
    </>
  );
}

// Document review card — mirrors SignPage's "review" step.
export function SignDocSkeleton() {
  return (
    <div role="status" aria-label="Loading document">
      <style>{shimmerStyle}</style>
      <Stagger i={0} style={{ ...cardBox, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${CARD_LINE}` }}>
          <Sk w={90} h={9} style={{ marginBottom: 12 }} />
          <Sk w="75%" h={24} r={8} style={{ marginBottom: 10 }} />
          <Sk w="45%" h={11} />
        </div>
        <div style={{ padding: 24 }}>
          {[100, 94, 98, 70].map((w, i) => <Sk key={i} w={`${w}%`} h={11} style={{ marginBottom: 12 }} />)}
          <div style={{ height: 14 }} />
          {[96, 88, 60].map((w, i) => <Sk key={i} w={`${w}%`} h={11} style={{ marginBottom: 12 }} />)}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: `1px dashed ${CARD_LINE}` }}>
            <Sk w={60} h={10} />
            <Sk w={110} h={26} r={8} />
          </div>
        </div>
      </Stagger>
      <Stagger i={2} style={{ marginTop: 16 }}>
        <Sk w="100%" h={50} r={14} />
      </Stagger>
    </div>
  );
}

// Client portal page — header, provider card, stats, tabs, doc list.
export function PortalSkeleton() {
  return (
    <div role="status" aria-label="Loading documents" style={{ minHeight: "100vh", background: bg }}>
      <style>{shimmerStyle}</style>
      <div style={{ background: CARD_BG, borderBottom: `1px solid ${CARD_LINE}`, padding: "22px 28px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Sk w={32} h={32} r={8} />
            <div><Sk w={80} h={8} style={{ marginBottom: 6 }} /><Sk w={100} h={14} /></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Sk w={120} h={14} style={{ marginBottom: 6 }} /><Sk w={90} h={10} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px" }}>
        <Stagger i={0} style={{ ...cardBox, borderRadius: 18, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><Sk w={130} h={9} style={{ marginBottom: 8 }} /><Sk w={160} h={18} /></div>
          <Sk w={96} h={38} r={11} />
        </Stagger>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[0, 1, 2].map(i => (
            <Stagger key={i} i={i + 1} style={{ ...cardBox, borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Sk w="60%" h={26} style={{ marginBottom: 10 }} /><Sk w="50%" h={9} />
            </Stagger>
          ))}
        </div>
        <Stagger i={4} style={{ ...cardBox, borderRadius: 14, padding: 6, display: "flex", gap: 6, marginBottom: 22 }}>
          {[0, 1, 2, 3].map(i => <Sk key={i} w="25%" h={34} r={10} />)}
        </Stagger>
        {[0, 1, 2].map(i => (
          <Stagger key={i} i={5 + i} style={{ ...cardBox, borderRadius: 18, padding: 22, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><Sk w="55%" h={16} style={{ marginBottom: 8 }} /><Sk w="35%" h={10} /></div>
              <Sk w={80} h={24} r={100} />
            </div>
            <div style={{ display: "flex", gap: 10 }}><Sk w={110} h={34} r={11} /><Sk w={90} h={34} r={11} /></div>
          </Stagger>
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ w = "100%", h = 14, r = 8, mb = 0 }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <Sk w={w} h={h} r={r} style={{ marginBottom: mb }} />
    </>
  );
}
