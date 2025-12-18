import { useNavigate } from "react-router-dom";
import "./authWelcome.css";
import logo from "../../assets/logochuan.png";

export default function AuthWelcome() {
  const nav = useNavigate();

  return (
    <div className="auth-root">
      <div className="auth-shell">
        <div className="aw2">
          {/* nền hoạ tiết */}
          <div className="aw2-bg" aria-hidden="true" />
          <div className="aw2-triangles" aria-hidden="true" />
          <div className="aw2-sparkle" aria-hidden="true" />

          <div className="aw2-content">
            <div className="aw3-head">
              <div className="aw3-greeting">Chào mừng bạn đến với</div>
            </div>

            <div className="aw3-logoArea">
              <img className="aw3-logo" src={logo} alt="RoadHelp logo" />
            </div>

            <div className="aw2-actions">
              <button className="aw2-btn aw2-primary" onClick={() => nav("/auth/login")}>
                <span className="aw2-leftIcon" aria-hidden="true">
                  {/* lock */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 11V8.8C7 6.15 9.15 4 11.8 4h.4C14.85 4 17 6.15 17 8.8V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7.2 11H16.8c.66 0 1.2.54 1.2 1.2v6.6c0 .66-.54 1.2-1.2 1.2H7.2c-.66 0-1.2-.54-1.2-1.2v-6.6c0-.66.54-1.2 1.2-1.2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Đăng nhập</span>
              </button>

              <button className="aw2-btn aw2-outline" onClick={() => nav("/auth/register")}>
                <span>Đăng ký</span>
                <span className="aw2-rightIcon" aria-hidden="true">
                  {/* arrow */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
