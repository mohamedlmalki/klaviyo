import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from '@/contexts/AccountContext';
import { toast } from 'sonner';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Updated schema to include the listId
const addSubscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  listId: z.string().min(1, { message: "Please select a list." }),
});

type AddSubscriberForm = z.infer<typeof addSubscriberSchema>;
type KlaviyoList = { id: string; name: string; };

export const AddSubscriber: React.FC = () => {
  const { currentAccount } = useAccounts();
  const [lists, setLists] = useState<KlaviyoList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  
  const form = useForm<AddSubscriberForm>({
    resolver: zodResolver(addSubscriberSchema),
    defaultValues: {
      email: '',
      listId: '',
    },
  });

  // Effect to fetch lists when the current account changes
  useEffect(() => {
    const fetchLists = async () => {
      if (currentAccount) {
        setIsLoadingLists(true);
        form.reset(); // Reset form when account changes
        try {
          const response = await fetch(`${apiUrl}/api/lists/${currentAccount.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch lists');
          }
          const data = await response.json();
          setLists(data);
        } catch (error) {
          toast.error("Could not fetch lists", { description: "Please check the API key and permissions." });
          setLists([]); // Clear lists on error
        } finally {
          setIsLoadingLists(false);
        }
      } else {
        setLists([]);
        form.reset();
      }
    };

    fetchLists();
  }, [currentAccount]); // FIX: Removed 'form' from the dependency array

  const onSubmit = async (data: AddSubscriberForm) => {
    if (!currentAccount) {
      toast.error("No Account Selected", { description: "Please select an API account first" });
      return;
    }

    const toastId = toast.loading("Adding subscriber...");
    try {
      const response = await fetch(`${apiUrl}/api/add-subscriber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, accountId: currentAccount.id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      toast.success("Subscriber Added", {
        id: toastId,
        description: `Successfully added ${data.email} to the list.`,
      });
      
      form.reset({ ...data, email: '' });

    } catch (error: any) {
      toast.error("Failed to add subscriber", {
        id: toastId,
        description: error.message,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 animate-slide-up">
        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-colored">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Add Subscriber</h1>
          <p className="text-muted-foreground">Add a new profile to a specific list</p>
        </div>
      </div>

      <Card className="hover-lift animate-scale-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Subscriber Information</CardTitle>
          <CardDescription>
            Select a list and enter the email address for the new subscriber.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Klaviyo List *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingLists || lists.length === 0}>
                      <FormControl>
                        <div className="relative">
                          <List className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <SelectTrigger className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder={isLoadingLists ? "Loading lists..." : "Select a list"} />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The list to which the subscriber will be added.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
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
                    <FormDescription>The email address of the subscriber.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => form.reset()} className="px-6">
                  Clear Form
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="px-8 bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-colored">
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
    </div>
  );
};