import React, { useState, useEffect } from 'react';
import { IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/notification'); // 通知ページへ遷移
  };

  return (
    <IconButton
      size="large"
      aria-label={`show ${notificationCount} new notifications`}
      color="inherit"
      onClick={handleClick}
    >
      <Badge badgeContent={notificationCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationIcon;
