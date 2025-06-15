
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const avatarNames = ["Sidharth", "GamerBadman", "CoolDude", "AnimeFan", "Ninja", "Wizard"];
const avatars = avatarNames.map(name => `https://api.multiavatar.com/${encodeURIComponent(name)}.svg?apikey=gIFEI2I822522S`);

interface AvatarPickerDialogProps {
  children: React.ReactNode;
  onAvatarSelect: (url: string) => void;
}

export function AvatarPickerDialog({ children, onAvatarSelect }: AvatarPickerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#211F2D] border-none text-white">
        <DialogHeader>
          <DialogTitle>Choose your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {avatars.map((url, index) => (
            <DialogClose asChild key={url}>
              <button onClick={() => onAvatarSelect(url)} className="flex flex-col items-center gap-2 group">
                <Avatar className="h-24 w-24 cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:ring-2 hover:ring-purple-500 transition-all">
                  <AvatarImage src={url} alt={`Avatar ${avatarNames[index]}`} />
                  <AvatarFallback>{avatarNames[index].substring(0,2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400 group-hover:text-white">{avatarNames[index]}</span>
              </button>
            </DialogClose>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
