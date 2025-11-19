// Format number to display with thousand separator (titik)
export const formatNumberDisplay = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  if (!cleaned) return '';
  
  // Add thousand separator (titik)
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted number back to plain number string
export const parseFormattedNumber = (value: string): string => {
  return value.replace(/\./g, '');
};
