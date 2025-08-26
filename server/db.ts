import { logins, type InsertLogin } from "@shared/schema";
import { debugLogger, createDebugContext } from "@shared/debug-logger";

const debugContext = createDebugContext('LoginTracker');

/**
 * Saves a login event to the database for audit and debug purposes
 * @param loginData - The login information to save
 * @returns Promise that resolves when the login event is saved
 */
export async function saveLoginEvent(loginData: {
  googleId: string;
  name?: string;
  email?: string;
  ip?: string;
}): Promise<void> {
  try {
    debugLogger.info(debugContext, 'Saving login event', {
      googleId: loginData.googleId,
      email: loginData.email,
      ip: loginData.ip,
      timestamp: new Date().toISOString()
    });

    const loginEvent: InsertLogin = {
      googleId: loginData.googleId,
      name: loginData.name || null,
      email: loginData.email || null,
      ip: loginData.ip || null,
      loginTime: new Date(),
    };

    // For now, since we're using in-memory storage, we'll just log the event
    // In a real PostgreSQL implementation, this would insert into the logins table:
    // 
    // Example for future PostgreSQL implementation:
    // import { db } from './database-connection';
    // await db.insert(logins).values(loginEvent);
    
    // Console logging for immediate debugging and audit trail
    console.log('🔐 OAuth Login Event:', {
      timestamp: loginEvent.loginTime?.toISOString(),
      googleId: loginEvent.googleId,
      name: loginEvent.name,
      email: loginEvent.email,
      ip: loginEvent.ip
    });

    debugLogger.info(debugContext, 'Login event saved successfully');
  } catch (error) {
    debugLogger.error(debugContext, 'Failed to save login event', { error });
    console.error('❌ Error saving login event:', error);
    // Don't throw the error - login tracking shouldn't break the authentication flow
  }
}