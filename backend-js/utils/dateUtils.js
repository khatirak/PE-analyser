const moment = require('moment');

function isAcquiredPharmacy(acquisitionDate) {
  if (!acquisitionDate) return false;
  
  // Parse date in DD MMMM YYYY format (e.g., "01 April 2024")
  const date = moment(acquisitionDate, 'DD MMMM YYYY');
  return date.isValid() && date.isBefore(moment());
}

function parseDate(dateString) {
  if (!dateString) return null;
  
  // Try different date formats
  const formats = [
    'DD MMMM YYYY',  // "01 April 2024"
    'YYYY-MM-DD',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'MMM-YY',
    'MMM YYYY',
    'YYYY-MM-DDTHH:mm:ss.SSSZ'
  ];
  
  for (const format of formats) {
    const parsed = moment(dateString, format, true);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }
  
  return null;
}

function formatDate(date, format = 'MMM-YY') {
  if (!date) return null;
  
  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format(format) : null;
}

function getMonthFromDate(dateString) {
  const date = parseDate(dateString);
  if (!date) return null;
  
  return moment(date).startOf('month').toDate();
}

module.exports = {
  isAcquiredPharmacy,
  parseDate,
  formatDate,
  getMonthFromDate
}; 