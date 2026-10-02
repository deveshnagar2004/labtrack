const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidRole = (role) => {
  return ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'].includes(role);
};

module.exports = {
  isValidEmail,
  isValidRole
};