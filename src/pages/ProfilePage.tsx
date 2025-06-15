import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { User, KeyRound, Edit, CheckCircle } from "lucide-react"
import { AvatarPickerDialog } from "@/components/AvatarPickerDialog"
import { Session } from "@supabase/supabase-js"
import NavBar from "@/components/NavBar"

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not be longer than 50 characters." }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const ProfilePage = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
    },
  })

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        setAvatarUrl(session.user.user_metadata.avatar_url);
        form.setValue("fullName", session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '');
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setSession(session);
          if (document.activeElement !== document.getElementById('fullName')) {
            form.setValue("fullName", session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '');
          }
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: data.fullName, avatar_url: avatarUrl },
    })

    if (error) {
      toast.error("Error updating profile", { description: error.message })
    } else {
      toast.success("Profile updated successfully!")
    }
    setIsSaving(false)
  }

  const handlePasswordReset = async () => {
    if (!session?.user.email) {
      toast.error("No email found for password reset.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast.error("Failed to send password reset email", { description: error.message });
    } else {
      toast.success("Password reset email sent!");
    }
  };

  const handleSearch = (anime: any) => {
    if (anime) {
      navigate("/");
    }
  };

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center bg-[#181520] text-white">Loading...</div>
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#181520]">
      <NavBar onSearch={handleSearch} />
      <div className="text-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
              <User className="w-8 h-8"/>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="bg-[#211F2D] border-none">
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-xs uppercase">Your Name</FormLabel>
                            <FormControl>
                              <Input id="fullName" className="bg-[#181520] border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel className="text-white text-xs uppercase">Email Address</FormLabel>
                        <div className="flex items-center gap-4">
                          <Input className="bg-[#181520] border-gray-700" value={user.email} readOnly />
                          {user.email_confirmed_at && (
                            <span className="flex items-center gap-2 text-sm text-pink-400 border border-pink-400 rounded-full px-3 py-1 whitespace-nowrap">
                              <CheckCircle className="w-4 h-4" />
                              Verified
                            </span>
                          )}
                        </div>
                      </FormItem>

                      <FormItem>
                        <FormLabel className="text-white text-xs uppercase">Joined</FormLabel>
                        <Input className="bg-[#181520] border-gray-700" value={new Date(user.created_at).toLocaleDateString()} readOnly />
                      </FormItem>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                        <Button type="button" variant="link" className="text-white hover:text-gray-300 p-0" onClick={handlePasswordReset}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Change password
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto">
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center justify-start pt-8">
              <AvatarPickerDialog onAvatarSelect={setAvatarUrl}>
                  <div className="relative group cursor-pointer">
                      <Avatar className="h-40 w-40 mb-4 border-4 border-[#211F2D]">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="bg-[#211F2D] text-4xl">
                              {form.getValues("fullName")?.[0]?.toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="w-8 h-8 text-white"/>
                      </div>
                  </div>
              </AvatarPickerDialog>
              <p className="text-white text-sm">Click avatar to change</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
