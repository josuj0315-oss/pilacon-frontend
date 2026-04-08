import React, { useState, useEffect } from 'react';
import { usePilaCon } from '../store/pilaconStore';
import { useNavigate } from 'react-router-dom';

export default function Inquiry() {
  const { user, submitInquiry } = usePilaCon();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status.loading) return;

    setStatus({ loading: true, success: false, error: null });

    const result = await submitInquiry(form);

    if (result.ok) {
      setStatus({ loading: false, success: true, error: null });
      setForm((prev) => ({
        ...prev,
        subject: '',
        message: '',
      }));
    } else {
      setStatus({ loading: false, success: false, error: result.error });
    }
  };

  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1 className="policy-title">문의하기</h1>
        
        <div className="policy-content">
          <p className="inquiry-intro">서비스 이용 중 궁금한 점이나 의견이 있으시면 언제든지 문의주세요.</p>
          
          <div className="inquiry-box">
            {user ? (
              <form className="inquiry-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>이름</label>
                  <input 
                    type="text" 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="이름을 입력해주세요" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>이메일</label>
                  <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="이메일을 입력해주세요" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>문의 제목</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="제목을 입력해주세요" 
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>문의 내용</label>
                  <textarea 
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="상세 내용을 5자 이상 입력해주세요" 
                    className="form-textarea" 
                    rows="6"
                    required
                  ></textarea>
                </div>

                {status.error && <p className="error-msg">{status.error}</p>}
                {status.success && <p className="success-msg">문의가 성공적으로 전달되었습니다. 빠른 시일 내에 답변드리겠습니다.</p>}

                <button 
                  type="submit" 
                  className={`submit-btn ${status.loading ? 'loading' : ''}`}
                  disabled={status.loading}
                >
                  {status.loading ? '보내는 중...' : '문의 보내기'}
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <div className="prompt-icon">✉️</div>
                <h3>로그인이 필요한 서비스입니다</h3>
                <p>문의 내역 관리 및 원활한 상담을 위해<br/>로그인 후 이용해 주시기 바랍니다.</p>
                <button className="login-link-btn" onClick={() => navigate('/login')}>
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
          
          <div className="email-direct">
            <p>직접 이메일 문의: <span>contact@fitjob.co.kr</span></p>
          </div>
        </div>
      </div>

      <style>{`
        .policy-page {
          background: #fff;
          min-height: 100vh;
          padding: 60px 24px 100px;
        }
        .policy-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .policy-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
          letter-spacing: -0.02em;
        }
        .inquiry-intro {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 32px;
          font-weight: 500;
        }
        .inquiry-box {
          background: #f8fafc;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #f1f5f9;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #5b5ff5;
          box-shadow: 0 0 0 3px rgba(91, 95, 245, 0.1);
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }
        .submit-btn:hover {
          background: #4a4edf;
        }
        .submit-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
        .submit-btn.loading {
          opacity: 0.8;
        }
        .error-msg {
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }
        .success-msg {
          color: #10b981;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }
        .login-prompt {
          text-align: center;
          padding: 20px 0;
        }
        .prompt-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }
        .login-prompt h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .login-prompt p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .login-link-btn {
          padding: 12px 24px;
          background: #5b5ff5;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }
        .email-direct {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }
        .email-direct span {
          color: #5b5ff5;
          font-weight: 700;
          margin-left: 4px;
        }
        @media (max-width: 768px) {
          .policy-page { padding: 40px 20px 80px; }
          .policy-title { font-size: 22px; margin-bottom: 30px; }
          .inquiry-box { padding: 24px 20px; }
        }
      `}</style>
    </div>
  );
}
