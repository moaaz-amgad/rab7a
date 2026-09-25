import React from 'react';
import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let color = 'default';

  switch (status) {
    case 'active':
    case 'paid':
    case 'present':
    case 'approved':
      color = 'success';
      break;

    case 'calculated':
    case 'on_leave':
    case 'pending':
      color = 'warning';
      break;

    case 'suspended':
    case 'late':
      color = 'orange';
      break;

    case 'terminated':
    case 'cancelled':
    case 'absent':
    case 'archived':
      color = 'error';
      break;

    default:
      color = 'default';
  }

  return <Tag color={color}>{label}</Tag>;
};
