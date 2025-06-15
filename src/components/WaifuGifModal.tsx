
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WaifuGifModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gifUrl?: string;
  name?: string;
}

const WaifuGifModal: React.FC<WaifuGifModalProps> = ({
  open,
  onOpenChange,
  gifUrl,
  name,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md flex flex-col items-center">
      <DialogHeader>
        <DialogTitle>{name ? name : "Random Waifu"}</DialogTitle>
        <DialogDescription>Powered by Waifu.it</DialogDescription>
      </DialogHeader>
      {gifUrl ? (
        <img
          src={gifUrl}
          alt={name || "random waifu"}
          className="w-64 h-64 object-contain rounded-lg shadow-lg bg-black/60"
        />
      ) : (
        <div className="text-muted-foreground">No image found.</div>
      )}
      <DialogClose asChild>
        <Button variant="outline" className="mt-3 w-full">Close</Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);

export default WaifuGifModal;
