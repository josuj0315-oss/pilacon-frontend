import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ICONS } from '../constants/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Partnership() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    businessCategory: 'CENTER_PILATES',
    businessCategoryEtc: '',
    interestType: 'RECRUITMENT',
    interestTypeEtc: '',
    content: '',
    agreed: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // 유효성 검증 로직
  const validate = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = '성함을 입력해주세요.';
        break;
      case 'phone':
        if (!value.trim()) error = '연락처를 입력해주세요.';
        else if (!/^[0-9]{9,11}$/.test(value.replace(/-/g, ''))) error = '올바른 연락처 형식이 아닙니다.';
        break;
      case 'email':
        if (!value.trim()) error = '이메일을 입력해주세요.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = '올바른 이메일 형식이 아닙니다.';
        break;
      case 'companyName':
        if (!value.trim()) error = '회사 또는 센터명을 입력해주세요.';
        break;
      case 'businessCategoryEtc':
        if (formData.businessCategory === 'ETC' && !value.trim()) error = '비즈니스 유형을 직접 입력해주세요.';
        break;
      case 'interestTypeEtc':
        if (formData.interestType === 'ETC' && !value.trim()) error = '관심 영역을 직접 입력해주세요.';
        break;
      case 'content':
        if (!value.trim()) error = '문의 내용을 입력해주세요.';
        else if (value.trim().length < 5) error = '내용을 최소 5자 이상 입력해주세요.';
        break;
      case 'agreed':
        if (!value) error = '개인정보 수집 및 이용에 동의가 필요합니다.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    // 실시간 에러 업데이트
    const error = validate(name, val);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validate(key, formData[key]);
      newTouched[key] = true;
    });
    
    setErrors(newErrors);
    setTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) {
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key] !== '');
      alert(newErrors[firstErrorField]);
      return;
    }

    setIsSubmitting(true);
    try {
      const { agreed, ...submitData } = formData;
      await axios.post(`${API_BASE_URL}/partnership`, submitData);
      
      alert('문의가 정상적으로 접수되었습니다. 담당자 확인 후 연락드리겠습니다.');
      
      setFormData({
        name: '', phone: '', email: '', companyName: '',
        businessCategory: 'CENTER_PILATES', businessCategoryEtc: '',
        interestType: 'RECRUITMENT', interestTypeEtc: '',
        content: '', agreed: false
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.response?.data?.message || '문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (name) => {
    if (touched[name] && errors[name]) {
      return <span className="error-text">{errors[name]}</span>;
    }
    return null;
  };

  return (
    <div className="partnership-container">
      <div className="partnership-header">
        <h1 className="partnership-title">핏잡과 함께 더 빠르게 채용하세요</h1>
        <p className="partnership-desc">
          핏잡은 필라테스 강사 채용에 최적화된 플랫폼입니다.<br />
          광고, 제휴, 입점 등 다양한 협업을 환영합니다.
        </p>
      </div>

      <form className="partnership-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${touched.name && errors.name ? 'has-error' : ''}`}>
          <label>이름</label>
          <input 
            type="text" name="name" value={formData.name} 
            onChange={handleChange} onBlur={handleBlur}
            placeholder="성함을 입력해주세요" required 
          />
          {renderError('name')}
        </div>

        <div className={`form-group ${touched.phone && errors.phone ? 'has-error' : ''}`}>
          <label>연락처</label>
          <input 
            type="tel" name="phone" value={formData.phone} 
            onChange={handleChange} onBlur={handleBlur}
            placeholder="연락처를 입력해주세요 (- 없이)" required 
          />
          {renderError('phone')}
        </div>

        <div className={`form-group ${touched.email && errors.email ? 'has-error' : ''}`}>
          <label>이메일</label>
          <input 
            type="email" name="email" value={formData.email} 
            onChange={handleChange} onBlur={handleBlur}
            placeholder="이메일 주소를 입력해주세요" required 
          />
          {renderError('email')}
        </div>

        <div className={`form-group ${touched.companyName && errors.companyName ? 'has-error' : ''}`}>
          <label>회사/센터명</label>
          <input 
            type="text" name="companyName" value={formData.companyName} 
            onChange={handleChange} onBlur={handleBlur}
            placeholder="회사명 또는 센터명을 입력해주세요" required 
          />
          {renderError('companyName')}
        </div>

        <div className="form-group">
          <label>비즈니스 유형</label>
          <select name="businessCategory" value={formData.businessCategory} onChange={handleChange} required>
            <option value="CENTER_PILATES">필라테스 센터</option>
            <option value="CENTER_FITNESS">피트니스 센터</option>
            <option value="BRAND">브랜드 (기구/의류 등)</option>
            <option value="IT_SERVICE">IT 서비스/플랫폼</option>
            <option value="EDUCATION">교육 기관</option>
            <option value="AGENCY">대행사/에이전시</option>
            <option value="ETC">기타 (직접 입력)</option>
          </select>
          {formData.businessCategory === 'ETC' && (
            <>
              <input 
                type="text" name="businessCategoryEtc" value={formData.businessCategoryEtc} 
                onChange={handleChange} onBlur={handleBlur}
                placeholder="비즈니스 유형을 직접 입력해주세요" className="etc-input" required 
              />
              {renderError('businessCategoryEtc')}
            </>
          )}
        </div>

        <div className="form-group">
          <label>관심 영역</label>
          <select name="interestType" value={formData.interestType} onChange={handleChange} required>
            <option value="RECRUITMENT">채용 공고 노출</option>
            <option value="ADVERTISEMENT">브랜드 광고</option>
            <option value="PARTNERSHIP">제휴/콜라보</option>
            <option value="CONTENT">콘텐츠 협업</option>
            <option value="ETC">기타 (직접 입력)</option>
          </select>
          {formData.interestType === 'ETC' && (
            <>
              <input 
                type="text" name="interestTypeEtc" value={formData.interestTypeEtc} 
                onChange={handleChange} onBlur={handleBlur}
                placeholder="관심 영역을 직접 입력해주세요" className="etc-input" required 
              />
              {renderError('interestTypeEtc')}
            </>
          )}
        </div>

        <div className={`form-group ${touched.content && errors.content ? 'has-error' : ''}`}>
          <label>문의 내용</label>
          <textarea 
            name="content" value={formData.content} 
            onChange={handleChange} onBlur={handleBlur}
            placeholder="상세 내용을 입력해주세요 (최소 5자)" rows="5" required 
          ></textarea>
          {renderError('content')}
        </div>

        <div className="form-agreement">
          <div className="agreement-top">
            <label className="checkbox-label">
              <input 
                type="checkbox" name="agreed" checked={formData.agreed} 
                onChange={handleChange} required 
              />
              <span>[필수] 개인정보 수집 및 이용에 동의합니다.</span>
            </label>
            <button 
              type="button" 
              className="view-privacy-btn"
              onClick={() => setIsPrivacyModalOpen(true)}
            >
              자세히보기
            </button>
          </div>
          {touched.agreed && errors.agreed && <p className="error-text mt-1">{errors.agreed}</p>}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? '요청 중...' : '광고 상담 요청하기'}
        </button>
      </form>

      {/* 개인정보 약관 모달 */}
      {isPrivacyModalOpen && (
        <div className="privacy-modal-overlay" onClick={() => setIsPrivacyModalOpen(false)}>
          <div className="privacy-modal-card" onClick={e => e.stopPropagation()}>
            <div className="privacy-modal-header">
              <h2 className="privacy-modal-title">개인정보 수집 및 이용 안내</h2>
              <button className="privacy-modal-close" onClick={() => setIsPrivacyModalOpen(false)}>
                <ICONS.close size={24} />
              </button>
            </div>
            <div className="privacy-modal-body">
              <div className="privacy-section">
                <h3 className="privacy-subtitle">1. 수집 항목</h3>
                <p className="privacy-text">- 이름, 연락처, 이메일, 회사(브랜드)명</p>
              </div>
              <div className="privacy-section">
                <h3 className="privacy-subtitle">2. 수집 목적</h3>
                <p className="privacy-text">- 광고/제휴 문의에 대한 상담 및 응대</p>
              </div>
              <div className="privacy-section">
                <h3 className="privacy-subtitle">3. 보유 기간</h3>
                <p className="privacy-text">- 문의 처리 완료 후 최대 3년 보관</p>
              </div>
              <p className="privacy-notice">※ 동의를 거부할 권리가 있으며, 거부 시 문의 접수가 제한됩니다.</p>
            </div>
            <div className="privacy-modal-footer">
              <button className="privacy-confirm-btn" onClick={() => setIsPrivacyModalOpen(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .partnership-container {
          padding: 40px 20px 80px;
          max-width: 600px;
          margin: 0 auto;
        }
        .partnership-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .partnership-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          word-break: keep-all;
        }
        .partnership-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          word-break: keep-all;
        }
        .partnership-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #5b5ff5;
          box-shadow: 0 0 0 3px rgba(91, 95, 245, 0.1);
        }
        .form-group.has-error input, .form-group.has-error textarea {
          border-color: #ef4444;
        }
        .form-group.has-error input:focus, .form-group.has-error textarea:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .etc-input {
          margin-top: 4px;
          background: #f8fafc;
          border-style: dashed !important;
        }
        .error-text {
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 4px;
          margin-left: 4px;
        }
        .form-agreement {
          margin: 10px 0;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }
        .agreement-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          font-weight: 600;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .view-privacy-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          padding: 4px;
        }
        .view-privacy-btn:hover {
          color: #64748b;
        }
        .submit-btn {
          height: 56px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
        .submit-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
        .mt-1 { margin-top: 4px; }

        /* Privacy Modal */
        .privacy-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 12000;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .privacy-modal-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalPop { from { transform: scale(0.9) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .privacy-modal-header {
          padding: 24px 24px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .privacy-modal-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .privacy-modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }
        .privacy-modal-body {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .privacy-section {
          margin-bottom: 20px;
        }
        .privacy-subtitle {
          font-size: 15px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
        }
        .privacy-text {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }
        .privacy-notice {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 24px;
          font-weight: 500;
        }
        .privacy-modal-footer {
          padding: 16px 24px 24px;
        }
        .privacy-confirm-btn {
          width: 100%;
          height: 52px;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
