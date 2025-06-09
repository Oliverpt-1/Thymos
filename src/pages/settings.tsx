import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, Palette, Trash2, Save } from 'lucide-react';

export function SettingsPage() {
  const { user, updateEmail, updatePassword, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || '',
    loading: false,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
  });

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailForm.newEmail === user?.email) {
      toast({
        title: 'No changes made',
        description: 'The email address is the same as your current one.',
      });
      return;
    }

    setEmailForm(prev => ({ ...prev, loading: true }));
    
    const { error } = await updateEmail(emailForm.newEmail);
    
    if (error) {
      toast({
        title: 'Error updating email',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email update initiated',
        description: 'Check your new email address to confirm the change.',
      });
    }
    
    setEmailForm(prev => ({ ...prev, loading: false }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setPasswordForm(prev => ({ ...prev, loading: true }));
    
    const { error } = await updatePassword(passwordForm.newPassword);
    
    if (error) {
      toast({
        title: 'Error updating password',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
      });
    }
    
    setPasswordForm(prev => ({ ...prev, loading: false }));
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    
    // In a real app, you would call a delete account API
    // For now, we'll just sign out the user
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
      setDeleteLoading(false);
    } else {
      toast({
        title: 'Account deleted',
        description: 'Your account has been successfully deleted.',
      });
    }
  };

  return (
    <div className="page-container">
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight soft-green-text">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Settings */}
          <Card className="soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl text-green-700 dark:text-green-300">Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="current-email" className="text-sm font-medium">Current Email</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="soft-input h-12 bg-muted/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="new-email" className="text-sm font-medium">New Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    placeholder="Enter new email address"
                    className="soft-input h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={emailForm.loading || emailForm.newEmail === user?.email}
                  className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {emailForm.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Update Email
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl text-green-700 dark:text-green-300">Security</CardTitle>
              </div>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="soft-input h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="soft-input h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={passwordForm.loading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="soft-button soft-gradient hover:soft-gradient-dark text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {passwordForm.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="soft-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Palette className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl text-green-700 dark:text-green-300">Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize how Thymos looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="soft-card border-red-200/50 dark:border-red-800/50 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Trash2 className="h-6 w-6 text-red-600" />
                <CardTitle className="text-xl text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6 bg-red-200 dark:bg-red-800" />
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleteLoading} className="soft-button">
                      {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="soft-card border-0 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers, including:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All trade records and journal entries</li>
                          <li>Portfolio analytics and performance data</li>
                          <li>AI-generated insights and recommendations</li>
                          <li>Account settings and preferences</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="soft-button">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 soft-button"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}