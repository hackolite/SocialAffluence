// Cookie-based authentication hook
import { useState, useEffect } from 'react';
import type { User } from '@/lib/user-utils';
import { debugLogger, createDebugContext } from "@shared/debug-logger";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug context for auth
  const debugContext = createDebugContext('useAuth');

  debugLogger.debug(debugContext, 'Auth hook initialized', {
    initialState: { isLoading, isAuthenticated, hasUser: !!user }
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authContext = { ...debugContext, operation: 'checkAuthStatus' };
    debugLogger.debug(authContext, 'Starting authentication status check');
    
    try {
      // Call the API to check authentication status
      // The server will read the HttpOnly username cookie and validate the user
      debugLogger.debug(authContext, 'Fetching user data from API');
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      debugLogger.debug(authContext, 'Auth API response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const userData = await response.json();
        debugLogger.info(authContext, 'User authenticated successfully', {
          userId: userData.id,
          username: userData.username,
          email: userData.email
        });
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        debugLogger.warn(authContext, 'User not authenticated', {
          status: response.status,
          statusText: response.statusText
        });
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      debugLogger.error(authContext, 'Auth check failed', { error });
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      debugLogger.debug(authContext, 'Auth check completed', {
        isAuthenticated,
        hasUser: !!user,
        isLoading: false
      });
    }
  };

  const logout = async () => {
    const logoutContext = { ...debugContext, operation: 'logout' };
    debugLogger.info(logoutContext, 'Starting user logout');
    
    try {
      debugLogger.debug(logoutContext, 'Calling logout API');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      debugLogger.debug(logoutContext, 'Logout API call completed');
      
      setUser(null);
      setIsAuthenticated(false);
      debugLogger.info(logoutContext, 'Logout successful, redirecting to home');
      window.location.href = '/';
    } catch (error) {
      debugLogger.error(logoutContext, 'Logout failed', { error });
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuthStatus,
  };
}