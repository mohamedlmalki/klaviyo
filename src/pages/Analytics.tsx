import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Analytics</h1>
          <p className="text-muted-foreground">Track your email performance metrics</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The analytics dashboard is currently under development. This will provide:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Email performance metrics (opens, clicks, unsubscribes)</li>
            <li>• Subscriber growth charts and insights</li>
            <li>• Campaign comparison reports</li>
            <li>• Detailed event logs for each email</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};