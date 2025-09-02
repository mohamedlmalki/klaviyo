import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Subscribers: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscribers</h1>
          <p className="text-muted-foreground">Manage your newsletter subscribers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The subscribers management page is currently under development. This will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• View all subscribers in a searchable table</li>
            <li>• Filter subscribers by tags and status</li>
            <li>• Edit subscriber information</li>
            <li>• Manage subscriber tags and preferences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};