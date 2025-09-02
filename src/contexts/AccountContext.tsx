import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiAccount } from '@/types';

interface AccountContextType {
  accounts: ApiAccount[];
  currentAccount: ApiAccount | null;
  setCurrentAccount: (account: ApiAccount | null) => void;
  addAccount: (account: Omit<ApiAccount, 'id' | 'status'>) => void;
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
  const [currentAccount, setCurrentAccountState] = useState<ApiAccount | null>(null);

  // Load accounts from localStorage on mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('newsletter-accounts');
    const savedCurrentAccountId = localStorage.getItem('newsletter-current-account');
    
    if (savedAccounts) {
      const parsedAccounts = JSON.parse(savedAccounts);
      setAccounts(parsedAccounts);
      
      if (savedCurrentAccountId) {
        const currentAcc = parsedAccounts.find((acc: ApiAccount) => acc.id === savedCurrentAccountId);
        if (currentAcc) {
          setCurrentAccountState(currentAcc);
        }
      }
    }
  }, []);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem('newsletter-accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  // Save current account to localStorage whenever it changes
  useEffect(() => {
    if (currentAccount) {
      localStorage.setItem('newsletter-current-account', currentAccount.id);
    } else {
      localStorage.removeItem('newsletter-current-account');
    }
  }, [currentAccount]);

  const setCurrentAccount = (account: ApiAccount | null) => {
    setCurrentAccountState(account);
  };

  const addAccount = (accountData: Omit<ApiAccount, 'id' | 'status'>) => {
    const newAccount: ApiAccount = {
      ...accountData,
      id: crypto.randomUUID(),
      status: 'checking'
    };
    
    setAccounts(prev => [...prev, newAccount]);
    
    // Set as current account if it's the first one
    if (accounts.length === 0) {
      setCurrentAccount(newAccount);
    }
    
    // Check status after adding
    checkAccountStatus(newAccount);
  };

  const updateAccount = (id: string, updates: Partial<ApiAccount>) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
    
    // Update current account if it was updated
    if (currentAccount?.id === id) {
      setCurrentAccountState(currentAccount ? { ...currentAccount, ...updates } : null);
    }
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    
    // Clear current account if it was deleted
    if (currentAccount?.id === id) {
      const remainingAccounts = accounts.filter(acc => acc.id !== id);
      setCurrentAccount(remainingAccounts.length > 0 ? remainingAccounts[0] : null);
    }
  };

  const checkAccountStatus = async (account: ApiAccount) => {
    updateAccount(account.id, { status: 'checking' });
    
    try {
      // Simulate API check - replace with actual Buttondown API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock status check result
      const isValid = account.apiKey.length > 10; // Simple validation
      
      updateAccount(account.id, { 
        status: isValid ? 'connected' : 'disconnected',
        lastChecked: new Date()
      });
    } catch (error) {
      updateAccount(account.id, { 
        status: 'disconnected',
        lastChecked: new Date()
      });
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