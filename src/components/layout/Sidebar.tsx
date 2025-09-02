import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Mail, 
  Users, 
  UserPlus, 
  UsersRound, 
  BarChart3, 
  ChevronDown,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountSelector } from '@/components/account/AccountSelector';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: 'Add Subscriber',
    href: '/add-subscriber',
    icon: UserPlus,
    description: 'Add a single subscriber'
  },
  {
    title: 'Bulk Import',
    href: '/bulk-import',
    icon: UsersRound,
    description: 'Import multiple subscribers'
  },
  {
    title: 'Subscribers',
    href: '/subscribers',
    icon: Users,
    description: 'View all subscribers'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Email performance metrics'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [location] = useLocation();

  return (
    <div className={cn(
      "h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-jakarta font-semibold text-sidebar-foreground">Newsletter</h1>
                <p className="text-xs text-sidebar-accent-foreground">Manager</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <div className="p-4 border-b border-sidebar-border">
        <AccountSelector isCollapsed={isCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-200",
                    isCollapsed ? "p-2" : "p-3",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft" 
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("shrink-0", isCollapsed ? "h-4 w-4" : "h-4 w-4 mr-3")} />
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs opacity-75">{item.description}</span>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-accent-foreground text-center">
            Newsletter Manager v1.0
          </div>
        </div>
      )}
    </div>
  );
};