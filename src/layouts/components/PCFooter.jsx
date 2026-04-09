import { Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import FitJobLogo from "../../components/FitJobLogo";


export default function PCFooter() {
  return (
    <footer className="pc-footer">
      <div className="pc-footer-inner">
        <div className="pc-footer-top">
          <div className="pc-footer-brand">
            <div className="pc-footer-logo" aria-label="FITJOB">
              <FitJobLogo height="20px" />
            </div>
            <p className="pc-footer-copy">필라테스/요가 강사를 위한 채용 플랫폼</p>
          </div>

          <nav className="pc-footer-links" aria-label="푸터 메뉴">
            <Link to="/terms" className="pc-footer-link">이용약관</Link>
            <Link to="/privacy" className="pc-footer-link">개인정보처리방침</Link>
            <Link to="/inquiry" className="pc-footer-link">문의하기</Link>
            <Link to="/notice" className="pc-footer-link">공지사항</Link>
          </nav>

          <div className="pc-footer-social">
            <a 
              href="https://www.instagram.com/fitjob.official/" 
              className="pc-footer-social-link" 
              aria-label="인스타그램"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61574309949507" 
              className="pc-footer-social-link" 
              aria-label="페이스북"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div className="pc-footer-bottom">
          <span className="pc-footer-email">contact@fitjob.co.kr</span>
          <span className="pc-footer-rights">© 2026 FITJOB. All rights reserved.</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 1199px) {
          .pc-footer {
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
            padding: 32px 20px 48px;
            margin-top: 40px;
          }
          .pc-footer-inner {
            max-width: 100%;
          }
          .pc-footer-top {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .pc-footer-logo {
            font-size: 20px;
            font-weight: 900;
            color: #1e1b4b;
            display: flex;
            align-items: center;
          }
          .pc-footer-logo-fit { color: #5c5fed; }
          .pc-footer-copy {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .pc-footer-links {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 20px;
          }
          .pc-footer-link {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            text-decoration: none;
          }
          .pc-footer-social {
            display: flex;
            gap: 12px;
          }
          .pc-footer-social-link {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            background: #fff;
          }
          .pc-footer-bottom {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .pc-footer-email {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
          }
          .pc-footer-rights {
            font-size: 12px;
            color: #94a3b8;
          }
        }
      `}</style>
    </footer>
  );
}
