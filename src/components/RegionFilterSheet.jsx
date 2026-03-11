import React, { useState } from 'react';
import { REGION_TABS, REGION_OPTIONS } from '../data/regions';

export default function RegionFilterSheet({
  initialRegions = [],
  onApply,
  onClose,
  disableAllOptions = false,
  maxSelect = 10,
  title = "지역 선택",
  includeTabName = false
}) {
  const [regionTab, setRegionTab] = useState(REGION_TABS[0]);
  const [tempRegions, setTempRegions] = useState(initialRegions);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleRegionClick = (name) => {
    const isAll = name.endsWith("전체") || name === "전국";

    if (disableAllOptions && isAll) {
      showToast("센터 주소는 상세 지역만 선택할 수 있어요");
      return;
    }

    if (maxSelect === 1) {
      const finalName = includeTabName && !name.includes(regionTab) ? `${regionTab} ${name}` : name;
      setTempRegions([finalName]);
      return;
    }

    // "전국" 선택 시 다른 모든 지역 선택 해제
    if (name === "전국") {
      setTempRegions(["전국"]);
      return;
    }

    if (isAll) {
      // "서울 전체" 등 선택 시 해당 탭의 다른 상세 지역 및 "전국" 삭제
      const otherTabsOnly = tempRegions.filter((x) =>
        x !== "전국" && !(REGION_OPTIONS[regionTab] || []).includes(x)
      );
      setTempRegions([...otherTabsOnly, name]);
      return;
    }

    // 상세 지역 선택 시 "전국" 및 해당 탭의 "전체" 옵션 삭제
    const allName = `${regionTab} 전체`;
    let next = tempRegions.filter((x) => x !== allName && x !== "전국");

    const finalName = includeTabName && !name.includes(regionTab) ? `${regionTab} ${name}` : name;

    if (next.includes(finalName) || next.includes(name)) {
      next = next.filter((x) => x !== finalName && x !== name);
    } else {
      if (next.length >= maxSelect) {
        showToast(`최대 ${maxSelect}개까지 선택 가능합니다.`);
        return;
      }
      next = [...next, finalName];
    }
    setTempRegions(next);
  };

  const handleApply = () => {
    if (tempRegions.length === 0) {
      showToast("지역을 선택해주세요.");
      return;
    }
    onApply(tempRegions);
    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>{title}</h3>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-tabs">
          {REGION_TABS.map((t) => (
            <button
              key={t}
              className={regionTab === t ? "sheet-tab active" : "sheet-tab"}
              onClick={() => setRegionTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="sheet-list">
          {(REGION_OPTIONS[regionTab] || []).map((name) => {
            const finalNameCandidate = includeTabName && !name.includes(regionTab) ? `${regionTab} ${name}` : name;
            const active = tempRegions.includes(finalNameCandidate) || tempRegions.includes(name);
            const isAll = name.endsWith("전체") || name === "전국";
            const disabled = disableAllOptions && isAll;

            return (
              <button
                key={name}
                className={`sheet-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => handleRegionClick(name)}
                disabled={disabled}
                style={disabled ? { color: '#cbd5e1', cursor: 'not-allowed' } : {}}
              >
                {name}
                {active && <span className="check">✓</span>}
              </button>
            );
          })}
        </div>
        <button className="sheet-apply" onClick={handleApply}>적용하기</button>

        {toast && <div className="toast-mini">{toast}</div>}
      </div>

      <style>{`
        .sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          z-index: 1000;
        }
        .sheet {
          width: 100%;
          background: #fff;
          border-radius: 24px 24px 0 0;
          padding: 24px 20px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .sheet-header h3 {
          font-size: 18px;
          font-weight: 800;
        }
        .sheet-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
        .sheet-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 16px;
          padding-bottom: 4px;
        }
        .sheet-tabs::-webkit-scrollbar { display: none; }
        .sheet-tab {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
          cursor: pointer;
        }
        .sheet-tab.active {
          background: #5b5ff5;
          color: #fff;
          border-color: #5b5ff5;
        }
        .sheet-list {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .sheet-item {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          background: #fff;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .sheet-item.active {
          border-color: #5b5ff5;
          color: #5b5ff5;
          background: #f5f6ff;
        }
        .sheet-item.disabled {
          background: #f8fafc;
          color: #cbd5e1;
        }
        .sheet-apply {
          width: 100%;
          padding: 16px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }
        .check {
          font-weight: 800;
        }
        .toast-mini {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 41, 59, 0.9);
          color: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          animation: fadeInOut 2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      `}</style>
    </div>
  );
}
