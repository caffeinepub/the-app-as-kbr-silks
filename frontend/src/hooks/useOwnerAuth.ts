import { useState, useCallback } from 'react';
import { OWNER_PHONE_NUMBERS } from '@/config/constants';

const SESSION_KEY = 'kbr_owner_verified';

function getStoredVerification(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useOwnerAuth() {
  const [verified, setVerified] = useState<boolean>(getStoredVerification);

  const verifyPhoneNumber = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '').replace(/^91/, '');
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
