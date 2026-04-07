import { Facebook, Instagram } from "lucide-react";

export default function PCFooter() {
  return (
    <footer className="pc-footer">
      <div className="pc-footer-inner">
        <div className="pc-footer-top">
          <div className="pc-footer-brand">
            <div className="pc-footer-logo" aria-label="FITJOB">
              <span className="pc-footer-logo-fit">FIT</span>
              <span className="pc-footer-logo-job">JOB</span>
            </div>
            <p className="pc-footer-copy">필라테스/요가 강사를 위한 채용 플랫폼</p>
          </div>

          <nav className="pc-footer-links" aria-label="푸터 메뉴">
            <a href="#" className="pc-footer-link">이용약관</a>
            <a href="#" className="pc-footer-link">개인정보처리방침</a>
          </nav>

          <div className="pc-footer-social">
            <a href="#" className="pc-footer-social-link" aria-label="인스타그램">
              <Instagram size={18} />
            </a>
            <a href="#" className="pc-footer-social-link" aria-label="페이스북">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div className="pc-footer-bottom">
          <span className="pc-footer-email">contact@fitjob.co.kr</span>
          <span className="pc-footer-rights">© 2026 FITJOB. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
