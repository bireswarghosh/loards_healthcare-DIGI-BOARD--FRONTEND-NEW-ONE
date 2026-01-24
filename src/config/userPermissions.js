// User Role-Based Access Control Configuration

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  RESTRICTED: 'RESTRICTED'
};

// Define restricted users by username
export const RESTRICTED_USERS = ['PARESH CH ROY'];

// Define menu permissions for each role
export const MENU_PERMISSIONS = {
  OPD: {
    VISIT_ENTRY: 'opd.visit_entry',
    VISIT_LIST: 'opd.visit_list',
    DR_RECT_VISIT_DETAIL: 'opd.dr_rect_visit_detail',
    EMR: 'opd.emr',
    OTHER_CHARGE: 'opd.other_charge',
    IVF_BIODATA: 'opd.ivf_biodata'
  }
};

// Check if user has permission for a specific menu item
export const hasPermission = (username, permission) => {
  // Check if user is in restricted list
  if (RESTRICTED_USERS.includes(username)) {
    // Restricted users cannot access Visit Entry and Visit List
    const restrictedPermissions = [
      MENU_PERMISSIONS.OPD.VISIT_ENTRY,
      MENU_PERMISSIONS.OPD.VISIT_LIST
    ];
    return !restrictedPermissions.includes(permission);
  }
  
  // All other users have full access
  return true;
};

// Check if user is restricted
export const isRestrictedUser = (username) => {
  return RESTRICTED_USERS.includes(username);
};
