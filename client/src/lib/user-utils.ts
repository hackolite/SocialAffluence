export interface User {
  id: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  googleId: string | null;
  password?: string | null;
}

/**
 * Generates user initials from first name, last name, or username
 */
export function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.firstName) {
    return user.firstName.substring(0, 2).toUpperCase();
  }
  
  if (user.lastName) {
    return user.lastName.substring(0, 2).toUpperCase();
  }
  
  // Fallback to username
  return user.username.substring(0, 2).toUpperCase();
}

/**
 * Gets the display name for a user
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.lastName) {
    return user.lastName;
  }
  
  // Fallback to username
  return user.username;
}