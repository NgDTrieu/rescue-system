import "./home.css";

type Tab = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

export default function BottomNav({
  activeKey,
  onChange,
}: {
  activeKey: string;
  onChange: (k: string) => void;
}) {
  const tabs: Tab[] = [
    {
      key: "home",
      label: "Home",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: "requests",
      label: "Yêu cầu",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7h10M7 12h10M7 17h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: "chat",
      label: "Tin nhắn",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 15a4 4 0 0 1-4 4H8l-4 3V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: "account",
      label: "Tài khoản",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 20a8 8 0 0 1 16 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="nav">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`nav-item ${activeKey === t.key ? "is-active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          <div className="nav-ico">{t.icon}</div>
          <div className="nav-lbl">{t.label}</div>
        </button>
      ))}
    </div>
  );
}
