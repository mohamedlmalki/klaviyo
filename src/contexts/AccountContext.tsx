import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiAccount } from '@/types';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

interface AccountContextType {
  accounts: ApiAccount[];
  currentAccount: ApiAccount | null;
  setCurrentAccount: (account: ApiAccount | null) => void;
  addAccount: (account: Omit<ApiAccount, 'id' | 'status' | 'senderName'>) => void;
  updateAccount: (id: string, updates: Partial<ApiAccount>) => void;
  deleteAccount: (id: string) => void;
  checkAccountStatus: (account: ApiAccount) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<ApiAccount | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/accounts`);
        const data = await response.json();
        setAccounts(data);
        if (data.length > 0) {
          setCurrentAccount(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };

    fetchAccounts();
  }, []);

  const addAccount = async (accountData: Omit<ApiAccount, 'id' | 'status' | 'senderName'>) => {
    const newAccount: ApiAccount = {
      ...accountData,
      id: crypto.randomUUID(),
      status: 'checking',
    };

    try {
      const response = await fetch(`${apiUrl}/api/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      });

      if (!response.ok) {
        throw new Error('Failed to add account');
      }

      const addedAccount = await response.json();
      
      // Update state and set the new account as current
      setAccounts(prev => [...prev, addedAccount]);
      setCurrentAccount(addedAccount);
      
      // Check the status of the new account immediately
      checkAccountStatus(addedAccount);

    } catch (error) {
      console.error('Failed to add account:', error);
    }
  };

  const updateAccount = async (id: string, updates: Partial<ApiAccount>) => {
    try {
      const response = await fetch(`${apiUrl}/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      const updatedAccount = await response.json();
      setAccounts(prev => prev.map(acc => (acc.id === id ? { ...acc, ...updatedAccount } : acc)));
      if (currentAccount?.id === id) {
        setCurrentAccount(prev => (prev ? { ...prev, ...updatedAccount } : null));
      }
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/accounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setAccounts(prevAccounts => {
        const remainingAccounts = prevAccounts.filter(acc => acc.id !== id);
        
        if (currentAccount?.id === id) {
          setCurrentAccount(remainingAccounts.length > 0 ? remainingAccounts[0] : null);
        }
        
        return remainingAccounts;
      });

    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

const checkAccountStatus = async (account: ApiAccount) => {
    updateAccount(account.id, { status: 'checking' });
    
    try {
      const response = await fetch(`${apiUrl}/api/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: account.apiKey }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        // Construct a detailed error message with the status code
        const errorMessage = `[Error ${result.statusCode || 'Network Error'}]: ${result.message}`;
        throw new Error(errorMessage);
      }

      // If response is OK (success)
      updateAccount(account.id, { 
        status: 'connected',
        lastChecked: new Date()
      });
      return { success: true, message: result.message };

    } catch (error: any) {
      // This catch block handles network errors or the error thrown above
      updateAccount(account.id, { 
        status: 'disconnected',
        lastChecked: new Date()
      });
      return { success: false, message: error.message };
    }
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      currentAccount,
      setCurrentAccount,
      addAccount,
      updateAccount,
      deleteAccount,
      checkAccountStatus
    }}>
      {children}
    </AccountContext.Provider>
  );
};