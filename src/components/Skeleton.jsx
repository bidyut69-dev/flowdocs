// ── Skeleton Screen Components ──────────────────────────────────────────
// Shimmer skeletons for the light tasteskill-inspired theme

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .sk {
    background: linear-gradient(90deg, #EFEDE8 25%, #F5F4F2 50%, #EFEDE8 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 8px;
  }
`;

const CARD_BG = "#FFFFFF";
const CARD_LINE = "#E7E5E0";

function Sk({ w = "100%", h = 14, r = 8, style = {} }) {
  return (
    <div className="sk" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />
  );
}

function StatCardSkeleton() {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${CARD_LINE}`, borderRadius: 18,
      padding: 24, position: "relative", overflow: "hidden",
    }}>
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
        <Sk w={180} h={14} style={{ marginBottom: 8 }} />
        <Sk w={110} h={10} />
      </td>
      <td style={{ padding: "20px 18px" }}><Sk w={60} h={10} /></td>
      <td style={{ padding: "20px 18px" }}><Sk w={76} h={22} r={100} /></td>
      <td style={{ padding: "20px 18px" }}><Sk w={80} h={14} /></td>
      <td style={{ padding: "20px 18px" }}><Sk w={90} h={10} /></td>
      <td style={{ padding: "20px 18px" }}>
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
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_LINE}`, borderRadius: 18, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
      <Sk w={44} h={44} r={12} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Sk w={130} h={14} style={{ marginBottom: 8 }} />
        <Sk w={180} h={10} />
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
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_LINE}`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Sk w={220} h={15} style={{ marginBottom: 8 }} />
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

export function DashboardSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Sk w={300} h={32} r={10} style={{ marginBottom: 12 }} />
          <Sk w={200} h={13} />
        </div>
        <Sk w={150} h={42} r={14} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Sk w={160} h={22} r={8} />
        <Sk w={280} h={38} r={12} />
      </div>

      <div style={{ background: CARD_BG, border: `1px solid ${CARD_LINE}`, borderRadius: 20, overflow: "hidden", marginBottom: 28 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${CARD_LINE}` }}>
              {[...Array(6)].map((_, i) => (
                <th key={i} style={{ padding: "16px 18px", textAlign: "left" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[0, 1].map(j => (
          <div key={j} style={{ background: CARD_BG, border: `1px solid ${CARD_LINE}`, borderRadius: 20, padding: 24 }}>
            <Sk w={170} h={20} style={{ marginBottom: 22 }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 14, borderBottom: `1px solid ${CARD_LINE}`, marginBottom: 14 }}>
                <Sk w={36} h={36} r={10} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Sk w="80%" h={12} style={{ marginBottom: 8 }} />
                  <Sk w={70} h={10} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function ClientsSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(5)].map((_, i) => <ClientCardSkeleton key={i} />)}
    </>
  );
}

export function ESignSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(3)].map((_, i) => <ESignCardSkeleton key={i} />)}
    </>
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
