import React from 'react';

export default function TermsOfService() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1 className="policy-title">이용약관</h1>
        <div className="policy-meta">시행일: 2026년 4월 8일</div>
        
        <div className="policy-content">
          <section className="policy-section">
            <h2>제 1 조 (목적)</h2>
            <p>본 약관은 "fitjob"(이하 "회사")이 운영하는 온라인 플랫폼 및 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 회원간의 권리, 의무 및 책임사항, 서비스 이용 조건 및 절차 등 기본적인 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 2 조 (회원가입 및 계정)</h2>
            <ol>
              <li>회원은 회사가 제시한 양식에 따라 정보를 입력함으로써 이용 신청을 하며, 회사가 이를 승낙함으로써 회원가입이 완료됩니다.</li>
              <li>회원은 자신의 계정(ID)과 비밀번호를 스스로 관리할 책임이 있으며, 이를 제3자가 이용하게 해서는 안 됩니다.</li>
              <li>회사는 타인의 정보를 도용하거나 허위 정보를 입력한 신청에 대해 승낙을 거절하거나 사후에 이용을 제한할 수 있습니다.</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>제 3 조 (서비스 이용 방식)</h2>
            <p>회사는 피트니스 및 요가 분야의 구인구직 정보를 제공하며, 강사와 센터 간의 연결을 돕는 다양한 기능을 제공합니다. 회원은 서비스를 통해 공고를 확인하고 지원할 수 있습니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 4 조 (공고 등록 및 지원 관련 책임)</h2>
            <ol>
              <li>공고를 등록하는 회원(센터 등)은 공고 내용의 진실성을 보장해야 하며, 허위 정보를 제공하여 발생하는 모든 책임은 해당 회원에게 있습니다.</li>
              <li>강사 회원은 자신의 이력 및 경력 사항을 사실대로 기재해야 합니다.</li>
              <li>회사는 채용의 가교 역할을 할 뿐, 실제 채용 계약의 당사자가 아니며 채용 결과에 대해 보증하지 않습니다.</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>제 5 조 (회원의 의무)</h2>
            <p>회원은 다음 행위를 해서는 안 됩니다.</p>
            <ul>
              <li>타인의 정보 도용 또는 부정 사용</li>
              <li>회사의 지식재산권을 침해하거나 서비스 운영을 방해하는 행위</li>
              <li>영리 목적의 광고성 정보를 회사의 동의 없이 게시하는 행위</li>
              <li>기타 법령에 위반되거나 사회상규에 반하는 행위</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>제 6 조 (게시물 관리)</h2>
            <p>회원은 자신이 게시한 정보에 대해 책임을 집니다. 회사는 게시물이 법령에 위반되거나 서비스의 목적에 부합하지 않는다고 판단될 경우, 사전 통지 없이 삭제하거나 노출을 제한할 수 있습니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 7 조 (서비스 제공의 변경 및 중단)</h2>
            <p>회사는 서비스의 안정적인 운영을 위해 점검이나 업데이트가 필요한 경우 서비스를 일시 중단할 수 있습니다. 이 경우 가급적 사전에 공지사항을 통해 안내합니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 8 조 (면책 조항)</h2>
            <ol>
              <li>회사는 천재지변, 전시 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              <li>회사는 서비스 내에서 회원 간에 이루어지는 직접적인 거래나 분쟁에 대해 개입하지 않으며 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>제 9 조 (문의처)</h2>
            <p>본 약관 및 서비스 이용과 관련된 문의는 아래 이메일을 통해 접수해 주시기 바랍니다.</p>
            <p className="contact-info">이메일: contact@fitjob.co.kr</p>
          </section>
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
          font-size: 32px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .policy-meta {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 40px;
          font-weight: 600;
        }
        .policy-content {
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
          word-break: keep-all;
        }
        .policy-section {
          margin-bottom: 48px;
        }
        .policy-section h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 16px;
          padding-left: 12px;
          border-left: 4px solid #5b5ff5;
        }
        .policy-section p {
          margin-bottom: 12px;
        }
        .policy-section ol, .policy-section ul {
          padding-left: 20px;
          margin-bottom: 12px;
        }
        .policy-section li {
          margin-bottom: 8px;
        }
        .contact-info {
          font-weight: 700;
          color: #5b5ff5;
          margin-top: 10px;
        }
        @media (max-width: 768px) {
          .policy-page {
            padding: 40px 20px 80px;
          }
          .policy-title {
            font-size: 24px;
          }
          .policy-section h2 {
            font-size: 17px;
          }
          .policy-content {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
