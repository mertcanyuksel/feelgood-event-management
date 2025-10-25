/**
 * Get row background color based on status
 * @param {boolean} isModified
 * @param {boolean} isDeleted
 * @param {string} contactId - uzm_contactid (NULL ise yeni kayıt)
 * @returns {string} CSS class name
 */
export const getRowClassName = (isModified, isDeleted, contactId) => {
  if (isDeleted) {
    return 'row-deleted';
  }

  // Yeni kayıt mı? (contactid NULL ise yeni kayıttır)
  if (contactId === null || contactId === undefined) {
    return 'row-new';
  }

  if (isModified) {
    return 'row-modified';
  }

  return '';
};

/**
 * Format date to Turkish locale
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Debounce function for search
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Show error message
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};
