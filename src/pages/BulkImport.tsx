import React from 'react';
import { UsersRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BulkImport: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
          <UsersRound className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Import</h1>
          <p className="text-muted-foreground">Import multiple subscribers at once</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The bulk import feature is currently under development. This will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Import multiple email addresses at once</li>
            <li>• Add tags to all imported subscribers</li>
            <li>• Monitor import progress in real-time</li>
            <li>• Export results after completion</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};