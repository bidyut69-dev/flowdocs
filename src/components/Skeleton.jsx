// ── Skeleton Screen Components ──────────────────────────────────────────
// Beautiful shimmer skeletons for dark theme

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .sk {
    background: linear-gradient(90deg, #1C1C1F 25%, #2A2A2E 50%, #1C1C1F 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 6px;
  }
`;

function Sk({ w = "100%", h = 14, r = 6, style = {} }) {
  return (
    <div className="sk" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

// ── Stat Card Skeleton ──
function StatCardSkeleton() {
  return (
    <div style={{
      background: "#141416", border: "1px solid #2A2A2E", borderRadius: 12,
      padding: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#2A2A2E" }} />
      <Sk w={80} h={10} style={{ marginBottom: 14 }} />
      <Sk w={120} h={28} r={8} style={{ marginBottom: 10 }} />
      <Sk w={90} h={10} />
    </div>
  );
}

// ── Table Row Skeleton ──
function TableRowSkeleton() {
  return (
    <tr style={{ borderBottom: "1px solid #2A2A2E" }}>
      <td style={{ padding: "18px 16px" }}>
        <Sk w={160} h={14} style={{ marginBottom: 8 }} />
        <Sk w={100} h={10} />
      </td>
      <td style={{ padding: "18px 16px" }}><Sk w={60} h={10} /></td>
      <td style={{ padding: "18px 16px" }}><Sk w={70} h={22} r={20} /></td>
      <td style={{ padding: "18px 16px" }}><Sk w={70} h={12} /></td>
      <td style={{ padding: "18px 16px" }}><Sk w={80} h={10} /></td>
      <td style={{ padding: "18px 16px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Sk w={64} h={28} r={8} />
          <Sk w={54} h={28} r={8} />
        </div>
      </td>
    </tr>
  );
}

// ── Client Card Skeleton ──
function ClientCardSkeleton() {
  return (
    <div style={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Sk w={120} h={14} style={{ marginBottom: 8 }} />
        <Sk w={180} h={10} />
      </div>
      <div style={{ textAlign: "right" }}>
        <Sk w={80} h={14} style={{ marginBottom: 8 }} />
        <Sk w={60} h={10} />
      </div>
    </div>
  );
}

// ── ESign Card Skeleton ──
function ESignCardSkeleton() {
  return (
    <div style={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <Sk w={200} h={15} style={{ marginBottom: 8 }} />
          <Sk w={140} h={10} />
        </div>
        <Sk w={90} h={26} r={20} />
      </div>
      <Sk w="100%" h={4} r={4} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 10 }}>
        <Sk w={120} h={30} r={20} />
        <Sk w={100} h={30} r={8} style={{ marginLeft: "auto" }} />
      </div>
    </div>
  );
}

// ── Dashboard Full Skeleton ──
export function DashboardSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <Sk w={280} h={28} r={8} style={{ marginBottom: 10 }} />
          <Sk w={200} h={13} />
        </div>
        <Sk w={140} h={38} r={8} />
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Sk w={150} h={20} r={6} />
        <Sk w={260} h={36} r={8} />
      </div>

      {/* Table */}
      <div style={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2A2A2E" }}>
              {[...Array(6)].map((_, i) => (
                <th key={i} style={{ padding: "14px 16px", textAlign: "left" }}>
                  <Sk w={[80, 50, 60, 60, 50, 70][i]} h={10} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)}
          </tbody>
        </table>
      </div>

      {/* Bottom 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[0, 1].map(j => (
          <div key={j} style={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 12, padding: 20 }}>
            <Sk w={160} h={18} style={{ marginBottom: 20 }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14, borderBottom: "1px solid #2A2A2E", marginBottom: 14 }}>
                <Sk w={32} h={32} r={8} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Sk w="80%" h={12} style={{ marginBottom: 8 }} />
                  <Sk w={60} h={10} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Clients Page Skeleton ──
export function ClientsSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(5)].map((_, i) => <ClientCardSkeleton key={i} />)}
    </>
  );
}

// ── ESign Page Skeleton ──
export function ESignSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(3)].map((_, i) => <ESignCardSkeleton key={i} />)}
    </>
  );
}

// ── Inline text skeleton ──
export function SkeletonLine({ w = "100%", h = 14, r = 6, mb = 0 }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <Sk w={w} h={h} r={r} style={{ marginBottom: mb }} />
    </>
  );
}

// shimmerStyle is used internally only