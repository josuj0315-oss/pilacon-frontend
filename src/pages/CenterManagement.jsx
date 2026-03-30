import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants/icons';
import { usePilaCon } from '../store/pilaconStore';
import { fetchCenters, createCenter, updateCenter, deleteCenter } from '../api/client';
import { MapPin, Phone, Dumbbell, ShieldCheck, MoreVertical, Plus, Trash2, Edit2 } from 'lucide-react';
import RegionFilterSheet from '../components/RegionFilterSheet';

const EQUIPMENT_OPTIONS = ["리포머", "바렐", "체어", "캐딜락", "스프링보드", "소도구"];

export default function CenterManagement() {
  const navigate = useNavigate();
  const { showToast, confirm } = usePilaCon();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingCenter, setEditingCenter] = useState(null);
  const [centerToDelete, setCenterToDelete] = useState(null);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const data = await fetchCenters();
      setCenters(data);
    } catch (error) {
      console.error('Failed to load centers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const handleAddClick = () => {
    setEditingCenter({
      name: '',
      businessName: '',
      address: '',
      addressDetail: '',
      phone: '',
      equipment: [],
      isDefault: false
    });
    setView('form');
  };

  const handleEditClick = (center) => {
    setEditingCenter(center);
    setView('form');
  };

  const handleDeleteClick = async (center) => {
    const ok = await confirm('센터 삭제', '정말로 이 센터를 삭제하시겠습니까?', { type: 'danger' });
    if (!ok) return;

    try {
      await deleteCenter(center.id);
      showToast('센터가 삭제되었습니다.');
      loadCenters();
    } catch (error) {
      showToast('삭제 실패: ' + error.message, 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingCenter.id) {
        await updateCenter(editingCenter.id, formData);
      } else {
        await createCenter(formData);
      }
      showToast('저장 완료');
      setView('list');
      loadCenters();
    } catch (error) {
      showToast('저장 실패: ' + error.message, 'error');
    }
  };

  if (view === 'form') {
    return (
      <CenterForm
        initialData={editingCenter}
        onSave={handleSave}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="center-mgmt-page">
      <header className="mgmt-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/mypage')}>
            <ICONS.back size={22} />
          </button>
          <h1 className="header-title">센터 관리</h1>
        </div>
        <button className="add-header-btn" onClick={handleAddClick}>
          <Plus size={20} />
          <span>센터 등록</span>
        </button>
      </header>

      <main className="mgmt-main">
        {loading ? (
          <div className="loading-state">불러오는 중...</div>
        ) : centers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MapPin size={48} color="#cbd5e1" />
            </div>
            <p className="empty-text">등록된 센터가 없습니다</p>
            <button className="primary-btn" onClick={handleAddClick}>
              센터 등록하기
            </button>
          </div>
        ) : (
          <div className="center-list">
            {centers.map(center => (
              <div key={center.id} className="center-card">
                <div className="card-header">
                  <div className="card-title-row">
                    <h3 className="center-name">{center.name}</h3>
                    {center.isDefault && (
                      <span className="default-badge">
                        <ShieldCheck size={12} />
                        기본
                      </span>
                    )}
                  </div>
                  <div className="card-actions">
                    <button className="action-btn" onClick={() => handleEditClick(center)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteClick(center)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {center.address && (
                    <div className="info-row">
                      <MapPin size={14} />
                      <span>{center.address}</span>
                    </div>
                  )}
                  {center.phone && (
                    <div className="info-row">
                      <Phone size={14} />
                      <span>{center.phone}</span>
                    </div>
                  )}
                  {center.equipment && (
                    <div className="info-row">
                      <Dumbbell size={14} />
                      <span className="equipment-text">{Array.isArray(center.equipment) ? center.equipment.join(', ') : center.equipment}</span>
                    </div>
                  )}
                  {center.addressDetail && (
                    <div className="info-row">
                      <MapPin size={14} opacity={0.5} />
                      <span style={{ fontSize: '13px', opacity: 0.8 }}>{center.addressDetail}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .center-mgmt-page {
          min-height: 100vh;
          background: #f8faff;
          padding-bottom: 40px;
        }
        .mgmt-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: transparent;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .header-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .add-header-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .mgmt-main {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .loading-state {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }
        .empty-state {
          padding: 80px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-icon {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 28px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .empty-text {
          font-size: 16px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 24px;
        }
        .primary-btn {
          padding: 14px 28px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 16px rgba(91, 95, 245, 0.2);
        }
        .center-list {
          display: grid;
          gap: 16px;
        }
        .center-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.01);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .card-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .center-name {
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
        }
        .default-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #eef2ff;
          color: #5b5ff5;
          font-size: 11px;
          font-weight: 800;
          border-radius: 8px;
        }
        .card-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          background: #f8faff;
          color: #64748b;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .action-btn.delete:hover {
          color: #ef4444;
          background: #fef2f2;
        }
        .card-body {
          display: grid;
          gap: 8px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }
        .info-row svg {
          flex-shrink: 0;
        }
        .equipment-text {
          font-style: italic;
          color: #475569;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          width: 100%;
          max-width: 360px;
          text-align: center;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .modal-desc {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 24px;
        }
        .modal-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .cancel-btn {
          padding: 14px;
          background: #f1f5f9;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }
        .confirm-btn {
          padding: 14px;
          background: #ef4444;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
        }
        .toast {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 41, 59, 0.9);
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          z-index: 2000;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CenterForm({ initialData, onSave, onCancel }) {
  const { showToast } = usePilaCon();
  const [formData, setFormData] = useState({
    ...initialData,
    equipment: Array.isArray(initialData.equipment)
      ? initialData.equipment
      : (typeof initialData.equipment === 'string' ? initialData.equipment.split(',').map(s => s.trim()).filter(Boolean) : [])
  });
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.address) {
      showToast('센터 주소를 상세 지역까지 선택해주세요.', 'error');
      return;
    }
    onSave(formData);
  };

  const handleAddressApply = (regions) => {
    if (regions.length > 0) {
      setFormData({ ...formData, address: regions[0] });
    }
  };

  const handleEquipmentToggle = (item) => {
    setFormData(prev => {
      const currentArr = Array.isArray(prev.equipment) ? prev.equipment : [];
      return {
        ...prev,
        equipment: currentArr.includes(item)
          ? currentArr.filter(e => e !== item)
          : [...currentArr, item]
      };
    });
  };

  const isInvalid = !formData.name.trim() || !formData.address || formData.address.includes('전체') || formData.address.includes('전국');

  return (
    <div className="center-mgmt-page">
      <header className="mgmt-header">
        <div className="header-left">
          <button className="back-btn" onClick={onCancel}>
            <ICONS.back size={22} />
          </button>
        </div>
        <h1 className="header-title">
          {initialData.id ? '센터 수정' : '센터 등록'}
        </h1>
        <div style={{ width: '40px' }}></div>
      </header>

      <main className="mgmt-main" style={{ paddingBottom: '120px' }}>
        <form className="center-form-el" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="field">
              <label className="label">센터명 <span className="required">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="예: XX필라테스 강남점"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="label">업체명(사업자명)</label>
              <input
                type="text"
                className="input"
                placeholder="예: (주)필라콘컴퍼니"
                value={formData.businessName || ''}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="label">주소 선택 <span className="required">*</span></label>
              <div
                className={`address-trigger ${!formData.address ? 'placeholder' : ''}`}
                onClick={() => setShowAddressSheet(true)}
              >
                <MapPin size={18} />
                <span>{formData.address || '주소를 선택해주세요'}</span>
              </div>
            </div>

            <div className="field">
              <label className="label">상세 주소 입력</label>
              <input
                type="text"
                className="input"
                placeholder="예: 테헤란로 123, 5층"
                value={formData.addressDetail || ''}
                onChange={e => setFormData({ ...formData, addressDetail: e.target.value })}
              />
              <p className="field-caption">건물명, 층수 등 상세 위치를 입력해주세요.</p>
            </div>

            <div className="field">
              <label className="label">센터 전화번호</label>
              <input
                type="text"
                className="input"
                placeholder="예: 02-123-4567"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="label">사용기구</label>
              <div className="equipment-chips-grid">
                {EQUIPMENT_OPTIONS.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`chip-btn ${Array.isArray(formData.equipment) && formData.equipment.includes(item) ? 'active' : ''}`}
                    onClick={() => handleEquipmentToggle(item)}
                  >
                    {item}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="직접 입력"
                  className="chip-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && Array.isArray(formData.equipment) && !formData.equipment.includes(val)) {
                        handleEquipmentToggle(val);
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </div>
              {Array.isArray(formData.equipment) && formData.equipment.filter(e => !EQUIPMENT_OPTIONS.includes(e)).length > 0 && (
                <div className="selected-equipment-tags">
                  {formData.equipment.filter(e => !EQUIPMENT_OPTIONS.includes(e)).map(e => (
                    <div key={e} className="custom-tag">
                      <span>{e}</span>
                      <button type="button" onClick={() => handleEquipmentToggle(e)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field toggle-field">
              <div className="toggle-info">
                <span className="label">기본 센터로 설정</span>
                <p className="helper">공고 올리기 시 기본으로 선택됩니다.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </form>
      </main>

      <div className="write-cta-area">
        <button
          className="submit-btn"
          disabled={isInvalid}
          onClick={handleSubmit}
        >
          저장하기
        </button>
      </div>

      {showAddressSheet && (
        <RegionFilterSheet
          initialRegions={formData.address ? [formData.address] : []}
          onApply={handleAddressApply}
          onClose={() => setShowAddressSheet(false)}
          disableAllOptions={true}
          maxSelect={1}
          title="주소 선택"
          includeTabName={true}
        />
      )}

      <style>{`
        :root {
          --main: #5b5ff5;
          --bg: #f6f7fb;
          --card: #ffffff;
          --text: #0f172a;
          --sub: #6b7280;
          --line: #e5e7eb;
          --input-bg: #f6f7fb;
        }

        .center-mgmt-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
        }

        .mgmt-header {
          height: 56px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text);
        }

        .header-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .add-header-btn {
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: var(--main);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mgmt-main {
          padding: 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .center-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .center-name {
          font-size: 17px;
          font-weight: 800;
          color: var(--text);
        }

        .default-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(91, 95, 245, 0.1);
          color: var(--main);
          font-size: 11px;
          font-weight: 800;
          border-radius: 6px;
          margin-left: 8px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--sub);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .form-section {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .label {
          font-size: 13px;
          font-weight: 700;
          color: var(--sub);
        }

        .required {
          color: var(--main);
        }

        .input {
          height: 50px;
          border-radius: 14px;
          border: none;
          background: var(--input-bg);
          padding: 0 16px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          outline: none;
        }

        .input:focus {
          box-shadow: 0 0 0 2px rgba(91, 95, 245, 0.2);
        }

        .address-trigger {
          height: 50px;
          border-radius: 14px;
          background: var(--input-bg);
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .address-trigger.placeholder {
          color: #94a3b8;
        }

        .field-caption {
          font-size: 12px;
          color: var(--sub);
          font-weight: 500;
          margin-top: 4px;
        }

        .equipment-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip-btn {
          height: 38px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip-btn.active {
          background: rgba(91, 95, 245, 0.1);
          color: var(--main);
          border-color: var(--main);
        }

        .chip-input {
          height: 38px;
          min-width: 80px;
          border-radius: 999px;
          border: 1.5px dashed #cbd5e1;
          background: transparent;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          outline: none;
        }

        .selected-equipment-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .custom-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }

        .custom-tag button {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .write-cta-area {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: center;
          z-index: 20;
        }

        .submit-btn {
          width: 100%;
          max-width: 600px;
          height: 54px;
          background: var(--main);
          border: none;
          border-radius: 16px;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .submit-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .toggle-field {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #e2e8f0;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider { background-color: var(--main); }
        input:checked + .slider:before { transform: translateX(20px); }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--sub);
          font-size: 14px;
          font-weight: 500;
          margin-top: 4px;
        }

        .toast {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 41, 59, 0.9);
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          z-index: 2000;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .loading-state, .empty-state {
          padding: 80px 20px;
          text-align: center;
          color: var(--sub);
          font-weight: 600;
        }
        .primary-btn {
          margin-top: 16px;
          padding: 12px 24px;
          background: var(--main);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: grid;
          place-items: center;
          z-index: 200;
          padding: 20px;
        }
        .modal-content {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          max-width: 320px;
          text-align: center;
        }
        .modal-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 20px;
        }
        .cancel-btn {
          padding: 12px;
          background: #f1f5f9;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          color: var(--sub);
          cursor: pointer;
        }
        .confirm-btn {
          padding: 12px;
          background: #ef4444;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
