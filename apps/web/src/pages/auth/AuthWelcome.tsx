import { useNavigate } from "react-router-dom";
import logo from "../../assets/logochuan.png";

export default function AuthWelcome() {
  const nav = useNavigate();

  return (
    <div className="auth-root">
      <div className="auth-shell auth-welcomeLite">
        <div className="welcome">
          <div className="welcome-top">
            <img className="welcome-logo" src={logo} alt="RoadHelp logo" />
            <div className="welcome-title">Welcome to RoadHelp</div>
            {/* <div className="welcome-sub"></div> */}
          </div>

          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={() => nav("/auth/login")}>
              Đăng nhập
            </button>
            <button className="btn btn-outline" onClick={() => nav("/auth/register")}>
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
