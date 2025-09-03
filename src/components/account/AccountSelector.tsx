import React, { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2, Check, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAccounts } from '@/contexts/AccountContext';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  isCollapsed: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({ isCollapsed }) => {
  const { accounts, currentAccount, setCurrentAccount, addAccount, updateAccount, deleteAccount, checkAccountStatus } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountApiKey, setNewAccountApiKey] = useState('');

  const handleStatusCheck = async () => {
    if (!currentAccount) return;

    toast.loading("Checking connection...", { id: "status-check" });
    const result = await checkAccountStatus(currentAccount);

    if (result.success) {
      toast.success("Connection Successful", {
        id: "status-check",
        description: result.message,
      });
    } else {
      toast.error("Connection Failed", {
        id: "status-check",
        description: result.message,
      });
    }
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim() || !newAccountApiKey.trim()) {
      toast.error("Error", { description: "Please fill in all required fields" });
      return;
    }
    addAccount({ name: newAccountName.trim(), apiKey: newAccountApiKey.trim() });
    setNewAccountName('');
    setNewAccountApiKey('');
    setShowAddDialog(false);
    toast.success("Account Added", { description: "New account has been added successfully" });
  };

  const handleEditAccount = () => {
    if (!currentAccount || !newAccountApiKey.trim()) return;
    updateAccount(currentAccount.id, { apiKey: newAccountApiKey.trim() });
    setNewAccountApiKey('');
    setShowEditDialog(false);
    toast.success("Account Updated", { description: "Account has been updated successfully" });
    if (currentAccount) {
      // Re-check status after updating the key
      checkAccountStatus({...currentAccount, apiKey: newAccountApiKey.trim()});
    }
  };

  const handleDeleteAccount = () => {
    if (!currentAccount) return;
    deleteAccount(currentAccount.id);
    toast.success("Account Deleted", { description: "Account has been deleted successfully" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <div className="status-dot connected" />;
      case 'disconnected': return <div className="status-dot disconnected" />;
      case 'checking': return <div className="status-dot checking" />;
      default: return <div className="status-dot disconnected" />;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="space-y-2">
        {!isCollapsed && <Label className="text-xs font-medium text-sidebar-accent-foreground">API Account</Label>}
        <Button onClick={() => setShowAddDialog(true)} variant="outline" className={cn("w-full justify-center border-dashed", isCollapsed ? "p-2" : "p-3")}>
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Add Account</span>}
        </Button>
        <AddAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} name={newAccountName} setName={setNewAccountName} apiKey={newAccountApiKey} setApiKey={setNewAccountApiKey} onAdd={handleAddAccount} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!isCollapsed && <Label className="text-xs font-medium text-sidebar-accent-foreground">API Account</Label>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-between bg-sidebar text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent", isCollapsed ? "p-2" : "p-3")}>
            <div className="flex items-center min-w-0">
              {getStatusIcon(currentAccount?.status || 'disconnected')}
              {!isCollapsed && (
                <div className="ml-2 flex flex-col items-start min-w-0">
                  <span className="font-medium truncate max-w-full">{currentAccount?.name || 'No Account'}</span>
                  {currentAccount?.jobProgress?.isRunning && <span className="text-xs text-sidebar-accent-foreground">{currentAccount.jobProgress.processed}/{currentAccount.jobProgress.total} Processing</span>}
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.map((account) => (
            <DropdownMenuItem key={account.id} onClick={() => setCurrentAccount(account)} className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(account.status)}
                <span className="ml-2">{account.name}</span>
              </div>
              {account.id === currentAccount?.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Account</DropdownMenuItem>
          {currentAccount && (
            <>
              <DropdownMenuItem onClick={() => { setNewAccountApiKey(currentAccount.apiKey); setShowEditDialog(true); }}><Edit className="h-4 w-4 mr-2" />Edit Account</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAccount} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete Account</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {currentAccount && (
        <Button variant="ghost" className={cn("w-full justify-center text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", isCollapsed ? "p-2" : "p-3")} onClick={handleStatusCheck}>
          <AlertCircle className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Check Status</span>}
        </Button>
      )}
      <AddAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} name={newAccountName} setName={setNewAccountName} apiKey={newAccountApiKey} setApiKey={setNewAccountApiKey} onAdd={handleAddAccount} />
      <EditAccountDialog open={showEditDialog} onOpenChange={setShowEditDialog} apiKey={newAccountApiKey} setApiKey={setNewAccountApiKey} onSave={handleEditAccount} />
    </div>
  );
};

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onAdd: () => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
  open,
  onOpenChange,
  name,
  setName,
  apiKey,
  setApiKey,
  onAdd
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Account</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="account-name">Account Name *</Label>
          <Input
            id="account-name"
            placeholder="My Newsletter Account"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="api-key">API Key *</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Your Klaviyo Private API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd}>
            Add Account
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSave: () => void;
}

const EditAccountDialog: React.FC<EditAccountDialogProps> = ({
  open,
  onOpenChange,
  apiKey,
  setApiKey,
  onSave
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Account</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-api-key">API Key *</Label>
          <Input
            id="edit-api-key"
            type="password"
            placeholder="Your Klaviyo Private API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);