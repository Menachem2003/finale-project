import React from "react";

interface AdminSidebarButtonProps {
  onClick: () => void;
  active: boolean;
  label: string;
}

export default function AdminSidebarButton({
  onClick,
  active,
  label,
}: AdminSidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={active ? "active" : ""}
      style={{ display: "block", width: "100%", marginBottom: "10px" }}
    >
      {label}
    </button>
  );
}
