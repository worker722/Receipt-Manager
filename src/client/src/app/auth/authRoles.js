/**
 * Authorization Roles
 */
const authRoles = {
  admin: ['admin'],
  staff: ['admin', 'staff'],
  user: ['admin', 'user'],
  onlyGuest: [],
};

export default authRoles;
