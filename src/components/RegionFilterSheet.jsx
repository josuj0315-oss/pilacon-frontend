import React, { useState } from 'react';
import { useBodyScrollLock } from '../utils/hooks';
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
  useBodyScrollLock();
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

  const handleRemoveTag = (region) => {
    setTempRegions(prev => prev.filter(r => r !== region));
  };

  const handleReset = () => {
    setTempRegions([]);
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
          <div className="header-left">
            <button className="reset-btn" onClick={handleReset}>초기화</button>
          </div>
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

        {/* 선택한 지역 태그 영역 추가 */}
        {tempRegions.length > 0 && !(tempRegions.length === 1 && tempRegions[0] === "전국") && (
          <div className="selected-regions-wrap">
            <div className="selected-regions-scroll">
              {tempRegions.map(region => (
                <div key={region} className="region-tag">
                  <span>{region}</span>
                  <button className="tag-remove" onClick={() => handleRemoveTag(region)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sheet-footer">
          <button className="sheet-apply" onClick={handleApply}>
            {tempRegions.length > 0 ? `${tempRegions.length}개 지역 선택 완료` : "선택 완료"}
          </button>
        </div>

        {toast && <div className="toast-mini">{toast}</div>}
      </div>

      <style>{`
        .sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center; /* 카드로 보이게 중앙 정렬 */
          justify-content: center;
          z-index: 10001;
          padding: 20px;
        }
        .sheet {
          width: 100%;
          max-width: 500px;
          background: #fff;
          border-radius: 32px; /* 상하단 라운드 통일 */
          padding: 24px 20px 20px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          position: relative;
        }
        .header-left {
          flex: 1;
        }
        .reset-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .reset-btn:hover {
          background: #f1f5f9;
          color: #64748b;
        }
        .sheet-header h3 {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          text-align: center;
          flex: 2;
        }
        .sheet-close {
          flex: 1;
          text-align: right;
          background: none;
          border: none;
          font-size: 20px;
          color: #cbd5e1;
          cursor: pointer;
        }
        .sheet-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 20px;
          padding-bottom: 4px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sheet-tabs::-webkit-scrollbar { display: none; }
        .sheet-tab {
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sheet-tab.active {
          background: #5b5ff5;
          color: #fff;
          border-color: #5b5ff5;
          box-shadow: 0 4px 12px rgba(91, 95, 245, 0.2);
        }
        .sheet-list {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          padding-right: 4px;
        }
        .sheet-item {
          padding: 16px;
          border-radius: 16px;
          border: 1.5px solid #f1f5f9;
          background: #fff;
          text-align: left;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.15s;
          color: #1e293b;
        }
        .sheet-item:active {
          transform: scale(0.97);
        }
        .sheet-item.active {
          border-color: #5b5ff5;
          color: #5b5ff5;
          background: #f5f6ff;
        }
        .sheet-item.disabled {
          background: #f8fafc;
          color: #cbd5e1;
          border-color: #f1f5f9;
        }
        
        /* 태그 영역 스타일 */
        .selected-regions-wrap {
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
          margin-bottom: 16px;
        }
        .selected-regions-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 100px;
          overflow-y: auto;
        }
        .region-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          color: #3b82f6;
        }
        .tag-remove {
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          color: #3b82f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }
        .tag-remove:hover {
          opacity: 1;
        }

        .sheet-footer {
          margin-top: auto;
        }
        .sheet-apply {
          width: 100%;
          height: 60px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 20px rgba(91, 95, 245, 0.2);
        }
        .sheet-apply:active {
          transform: scale(0.98);
          box-shadow: 0 5px 10px rgba(91, 95, 245, 0.2);
        }
        .check {
          font-weight: 900;
          font-size: 16px;
        }
        .toast-mini {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          color: #fff;
          padding: 12px 24px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          animation: fadeInOut 2s ease-in-out forwards;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
