
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, X, Settings } from "lucide-react"
import { Session } from "@supabase/supabase-js"
import NavBar from "@/components/NavBar"
import ProfileForm from "@/components/profile/ProfileForm"
import ProfileAvatar from "@/components/profile/ProfileAvatar"

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
          if (document.activeElement?.id !== 'fullName') {
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

  return (
    <div className="min-h-screen bg-[#181520]">
      <NavBar onSearch={handleSearch} />
      <div className="text-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                  <User className="w-8 h-8"/>
                  <h1 className="text-3xl font-bold">Edit Profile</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-white hover:bg-gray-700/50">
                  <Settings className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-gray-700/50">
                  <X className="w-8 h-8" />
                </Button>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ProfileForm 
                session={session} 
                form={form}
                onSubmit={onSubmit}
                isSaving={isSaving}
                handlePasswordReset={handlePasswordReset}
              />
            </div>

            <ProfileAvatar 
              avatarUrl={avatarUrl}
              onAvatarSelect={setAvatarUrl}
              fallbackName={form.getValues("fullName")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
