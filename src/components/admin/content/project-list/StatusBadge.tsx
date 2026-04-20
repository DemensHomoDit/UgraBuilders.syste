import React from "react";

interface StatusBadgeProps {
  status: "draft" | "pending" | "published" | "rejected" | "archived";
}

const statusMap = {
  draft: { label: "Черновик", color: "bg-gray-300 text-gray-800" },
  pending: { label: "На подтверждении", color: "bg-yellow-200 text-yellow-900" },
  published: { label: "Опубликовано", color: "bg-green-200 text-green-900" },
  rejected: { label: "Отклонено", color: "bg-red-200 text-red-900" },
  archived: { label: "Архив", color: "bg-blue-200 text-blue-900" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { label, color } = statusMap[status] || statusMap.draft;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>
  );
};

export default StatusBadge; 