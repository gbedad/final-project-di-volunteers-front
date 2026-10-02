// Same groups as the server (middlewares/authAdmin.js)
export const isStaff = (role) =>
  ['superadmin', 'admin', 'interviewer'].includes(role);

// Can manage missions, delete documents and use the Team page
export const isManager = (role) => ['superadmin', 'admin'].includes(role);

export const ROLE_LABELS = {
  volunteer: 'Bénévole',
  interviewer: 'Interviewer',
  admin: 'Admin',
  superadmin: 'Superadmin',
};
