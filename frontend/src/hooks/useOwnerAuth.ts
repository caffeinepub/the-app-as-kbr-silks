import { useState, useCallback } from 'react';
import { OWNER_PHONE_NUMBERS } from '@/config/constants';

const SESSION_KEY = 'kbr_owner_verified';
const ADMIN_PASSWORD = '9966';

function getStoredVerification(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useOwnerAuth() {
  const [verified, setVerified] = useState<boolean>(getStoredVerification);

  const verifyPhoneNumber = useCallback((input: string): boolean => {
    const trimmed = input.trim();

    // Check admin password first
    if (trimmed === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      setVerified(true);
      return true;
    }

    // Check authorized phone numbers
    const cleaned = trimmed.replace(/\D/g, '').replace(/^91/, '');
    const isOwner = OWNER_PHONE_NUMBERS.includes(cleaned);
    if (isOwner) {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      setVerified(true);
    }
    return isOwner;
  }, []);

  const clearVerification = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setVerified(false);
  }, []);

  return {
    isVerified: verified,
    verifyPhoneNumber,
    clearVerification,
  };
}
