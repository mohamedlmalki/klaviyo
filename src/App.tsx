import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountProvider } from '@/contexts/AccountContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Layout } from '@/components/layout/Layout';
import { AddSubscriber } from '@/pages/AddSubscriber';
import { BulkImport } from '@/pages/BulkImport';
import { Subscribers } from '@/pages/Subscribers';
import { Analytics } from '@/pages/Analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AccountProvider>
          <Router>
            <Layout>
              <Switch>
                <Route path="/" component={AddSubscriber} />
                <Route path="/add-subscriber" component={AddSubscriber} />
                <Route path="/bulk-import" component={BulkImport} />
                <Route path="/subscribers" component={Subscribers} />
                <Route path="/analytics" component={Analytics} />
                <Route>
                  <div className="flex items-center justify-center h-64 animate-fade-in">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
                      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                    </div>
                  </div>
                </Route>
              </Switch>
            </Layout>
          </Router>
        </AccountProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;