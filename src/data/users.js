const users = [];

const getNextUserId = () => String(users.length + 1);

module.exports = { users, getNextUserId };
