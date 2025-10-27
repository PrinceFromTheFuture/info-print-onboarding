"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTriggerClick?: () => void;
}

export function CreateTicketDialog({ open, onOpenChange, onTriggerClick }: CreateTicketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" onClick={onTriggerClick}>
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>Describe your issue and we'll get back to you as soon as possible.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input placeholder="Brief description of your issue" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea placeholder="Provide detailed information about your issue..." rows={5} />
          </div>
          <Button className="w-full">Create Ticket</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
