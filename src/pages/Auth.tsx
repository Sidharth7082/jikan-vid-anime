import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtSign, Lock, User } from "lucide-react";

const authSchema = z.object({
  email: z.string().min(1, { message: "Email or username is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  username: z.string().optional(),
});

const signUpSchema = authSchema.extend({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
});

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showResetView, setShowResetView] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const navigate = useNavigate();

  const resetPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
  });

  const updatePasswordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      } else if (session) {
        navigate("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const handleSignIn = async (values: z.infer<typeof authSchema>) => {
    setLoading(true);
    const isEmail = values.email.includes('@');
    let emailToSignIn = values.email;

    if (!isEmail) {
      // It's a username, let's get the email from our edge function
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('get-email-from-username', {
          body: { username: values.email },
        });

        if (invokeError) {
            console.error('Edge function invocation error:', invokeError);
            throw new Error("Invalid credentials");
        }
        
        if (!data || !data.email) {
            throw new Error("Invalid credentials");
        }
        
        emailToSignIn = data.email;
      } catch (e) {
          toast({
            title: "Sign-in failed",
            description: "Invalid username or password.", // Generic error
            variant: "destructive",
          });
          setLoading(false);
          return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToSignIn,
      password: values.password,
    });
    if (error) {
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Signed in successfully!" });
      navigate("/");
    }
    setLoading(false);
  };

  const handleSignUp = async (values: z.infer<typeof authSchema>) => {
    const result = signUpSchema.safeParse(values);
    if (!result.success) {
      form.clearErrors();
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as "email" | "password" | "username", {
          type: "manual",
          message: issue.message,
        });
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          username: result.data.username,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast({
        title: "Sign-up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign-up successful!",
        description: "Please check your email to verify your account.",
      });
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      toast({
        title: "Guest login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Signed in as guest!" });
      navigate("/");
    }
    setLoading(false);
  };

  const handlePasswordReset = async (values: { email: string }) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for a link to reset your password.",
      });
      setShowResetView(false);
    }
  };

  const handleUpdatePassword = async (values: { password: string }) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password.",
      });
      setShowUpdatePassword(false);
      await supabase.auth.signOut();
      navigate('/auth');
    }
  };

  const AuthForm = ({ isSignUp }: { isSignUp?: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(isSignUp ? handleSignUp : handleSignIn)} className="space-y-6">
        {isSignUp && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="your_username" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isSignUp ? "Email" : "Email or Username"}</FormLabel>
              <FormControl>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={isSignUp ? "your@email.com" : "email or username"} {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isSignUp && (
            <div className="flex justify-end -mt-2">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm font-normal text-purple-600 hover:text-purple-800"
                  onClick={() => setShowResetView(true)}
                >
                  Forgot your password?
                </Button>
            </div>
        )}
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" disabled={loading}>
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </form>
    </Form>
  );

  const ResetPasswordForm = () => {
    const resetForm = useForm<{ email: string }>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { email: "" },
    });

    return (
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-6">
          <FormField
            control={resetForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="your@email.com" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <Button variant="link" onClick={() => setShowResetView(false)} className="w-full text-purple-600">
            Back to Sign In
          </Button>
        </form>
      </Form>
    );
  };

  const UpdatePasswordForm = () => {
    const updateForm = useForm<{ password: string }>({
      resolver: zodResolver(updatePasswordSchema),
      defaultValues: { password: "" },
    });

    return (
      <Card className="w-full max-w-md shadow-2xl border-purple-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-700">Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdatePassword)} className="space-y-6">
              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90 p-4">
      {showUpdatePassword ? <UpdatePasswordForm /> : (
        <Card className="w-full max-w-md shadow-2xl border-purple-100">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-700 tracking-tight">
              captureordie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full" onValueChange={() => setShowResetView(false)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="pt-6">
                {showResetView ? <ResetPasswordForm /> : <AuthForm />}
              </TabsContent>
              <TabsContent value="signup" className="pt-6">
                <AuthForm isSignUp />
              </TabsContent>
            </Tabs>
            {!showResetView && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleGuestLogin} disabled={loading} className="w-full">
                  Continue as Guest
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthPage;
