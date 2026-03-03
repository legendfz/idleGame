export function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="subpage-header">
      <button className="back-btn" onClick={onBack}>← 返回</button>
      <span className="subpage-title">{title}</span>
    </div>
  );
}
