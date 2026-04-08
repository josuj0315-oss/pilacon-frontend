import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1 className="policy-title">개인정보처리방침</h1>
        <div className="policy-meta">최종 수정일: 2026년 4월 8일</div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>제 1 조 (수집하는 개인정보 항목)</h2>
            <p>회사는 회원가입, 서비스 제공, 원활한 고객 상담을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul>
              <li>필수항목: 이름, 이메일, 휴대전화번호, 비밀번호, 닉네임</li>
              <li>강사 선택항목: 경력사항, 자격증 정보, 자기소개, 프로필 이미지</li>
              <li>서비스 이용 시 자동 수집 항목: 접속 로그, 쿠키, 접속 IP 정보, 서비스 이용 기록</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>제 2 조 (개인정보 수집 방법)</h2>
            <p>회사는 다음과 같은 방법으로 개인정보를 수집합니다.</p>
            <ul>
              <li>홈페이지 회원가입 및 프로필 관리 페이지</li>
              <li>고객센터 문의 및 상담 과정</li>
              <li>생성정보 수집 도구를 통한 자동 수집</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>제 3 조 (개인정보 이용 목적)</h2>
            <p>수집된 개인정보는 다음의 목적을 위해 활용됩니다.</p>
            <ol>
              <li>서비스 제공 및 계약 이행 (구인구직 매칭, 콘텐츠 제공)</li>
              <li>회원 관리 (본인 확인, 가입 의사 확인, 민원 처리)</li>
              <li>신규 서비스 개발 및 마케팅 활용 (통계적 분석, 이벤트 정보 전송)</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>제 4 조 (개인정보 보관 및 파기)</h2>
            <ol>
              <li>회사는 회원이 탈퇴하거나 수집 목적이 달성된 경우 해당 정보를 지체 없이 파기합니다.</li>
              <li>단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 보관할 수 있습니다.</li>
              <li>파기 방법: 전자적 파일 형태는 복구가 불가능한 기술적 방법을 사용하여 삭제하며, 종이 문서는 분쇄하거나 소각합니다.</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>제 5 조 (제3자 제공 여부)</h2>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우나 법령의 규정에 의거한 경우에는 예외로 합니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 6 조 (처리 위탁 여부)</h2>
            <p>회사는 원활한 서비스 제공을 위해 필요한 경우 개인정보 처리를 외부 전문업체에 위탁할 수 있습니다. 위탁 시 관련 법령에 따라 위탁 계약 시 안전하게 관리될 수 있도록 조치합니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 7 조 (이용자의 권리)</h2>
            <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입 해지(탈퇴)를 요청할 수 있습니다. 개인정보 보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
          </section>

          <section className="policy-section">
            <h2>제 8 조 (개인정보 보호를 위한 조치)</h2>
            <p>회사는 이용자의 개인정보를 취급함에 있어 분실, 도난, 누출, 변조 또는 훼손되지 않도록 다음과 같은 기술적/관리적 대책을 강구하고 있습니다.</p>
            <ul>
              <li>비밀번호 암호화 저장</li>
              <li>해킹 등에 대비한 기술적 대책 (백신 및 보안 프로그램 설치)</li>
              <li>개인정보 취급 직원의 최소화 및 교육</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>제 9 조 (문의처)</h2>
            <p>개인정보와 관련된 문의 사항은 아래 보호책임자 이메일을 통해 문의해 주시기 바랍니다.</p>
            <p className="contact-info">개인정보관리 및 서비스 담당: contact@fitjob.co.kr</p>
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
          border-left: 4px solid #10b981;
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
          color: #10b981;
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
