// Session expiry: 10 days in milliseconds
const SESSION_EXPIRY_TIME = 10 * 24 * 60 * 60 * 1000; // 10 days

export const setSessionExpiry = () => {
  const expiryTime = Date.now() + SESSION_EXPIRY_TIME;
  localStorage.setItem('sessionExpiry', expiryTime.toString());
};

export const getSessionExpiry = (): number | null => {
  const expiry = localStorage.getItem('sessionExpiry');
  return expiry ? parseInt(expiry) : null;
};

export const isSessionExpired = (): boolean => {
  const expiry = getSessionExpiry();
  if (!expiry) return false;
  return Date.now() > expiry;
};

export const getRemainingSessionTime = (): number => {
  const expiry = getSessionExpiry();
  if (!expiry) return 0;
  const remaining = expiry - Date.now();
  return remaining > 0 ? remaining : 0;
};

export const clearSessionExpiry = () => {
  localStorage.removeItem('sessionExpiry');
};

export const formatRemainingTime = (ms: number): string => {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `${days} hari ${hours} jam`;
  } else if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  } else {
    return `${minutes} menit`;
  }
};
