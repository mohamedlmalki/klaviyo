import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAccounts } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';

const addSubscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  tags: z.string(),
});

type AddSubscriberForm = z.infer<typeof addSubscriberSchema>;

export const AddSubscriber: React.FC = () => {
  const { currentAccount } = useAccounts();
  const { toast } = useToast();
  
  const form = useForm<AddSubscriberForm>({
    resolver: zodResolver(addSubscriberSchema),
    defaultValues: {
      email: '',
      tags: '',
    },
  });

  const onSubmit = async (data: AddSubscriberForm) => {
    if (!currentAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an API account first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call - replace with actual Buttondown API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Subscriber Added",
        description: `Successfully added ${data.email} to your newsletter`,
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subscriber. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentAccount) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No Account Selected</h2>
            <p className="text-muted-foreground mb-4">
              Please add and select an API account to start adding subscribers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentAccount.status !== 'connected') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold mb-2">Account Not Connected</h2>
            <p className="text-muted-foreground mb-4">
              Your API account is not properly connected. Please check your API key.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 animate-slide-up">
        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-colored">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Add Subscriber</h1>
          <p className="text-muted-foreground">Add a single subscriber to your newsletter</p>
        </div>
      </div>

      {/* Current Account Info */}
      <Card className="border-l-4 border-l-success bg-success-light/50 hover-lift animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Adding to: {currentAccount.name}</p>
              <p className="text-sm text-muted-foreground">Sender: {currentAccount.senderName}</p>
            </div>
            <div className="status-dot connected" />
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card className="hover-lift animate-scale-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Subscriber Information</CardTitle>
          <CardDescription>
            Enter the email address and optional tags for the new subscriber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email Address *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="subscriber@example.com" 
                          className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      The email address of the subscriber
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Tags (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="newsletter, welcome, premium"
                          className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Comma-separated tags for organizing subscribers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="px-6"
                >
                  Clear
                </Button>
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="px-8 bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-colored"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Subscriber
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="bg-muted/30 border-0 shadow-sm hover-lift animate-fade-in">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 text-foreground">💡 Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use tags to segment your audience and send targeted campaigns</li>
            <li>• Subscribers will receive a confirmation email if double opt-in is enabled</li>
            <li>• You can always edit subscriber information later from the Subscribers page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};