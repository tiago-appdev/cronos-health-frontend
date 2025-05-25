export const generateUniqueUser = (type = 'patient') => ({
  name: `Test ${type} ${Date.now()}`,
  email: `${type}.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  userType: type
});

export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const getNextWeekDate = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek;
};