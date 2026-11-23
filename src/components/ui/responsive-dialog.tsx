"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ResponsiveDialogContext = React.createContext(true);

function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <ResponsiveDialogContext.Provider value={true}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={false}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveDialogContext.Provider>
  );
}

function ResponsiveDialogTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogTrigger {...props}>{children}</DialogTrigger>
  ) : (
    <DrawerTrigger {...props}>{children}</DrawerTrigger>
  );
}

function ResponsiveDialogContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className}>
      <ScrollArea className="max-h-[85vh] px-4 pb-6 overflow-y-auto" data-lenis-prevent>
        {children}
      </ScrollArea>
    </DrawerContent>
  );
}

function ResponsiveDialogTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  ) : (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  );
}

function ResponsiveDialogDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  ) : (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  );
}

function ResponsiveDialogHeader({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  ) : (
    <DrawerHeader className={className} {...props}>
      {children}
    </DrawerHeader>
  );
}

function ResponsiveDialogFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  ) : (
    <DrawerFooter className={className} {...props}>
      {children}
    </DrawerFooter>
  );
}

function ResponsiveDialogClose({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const isDesktop = React.useContext(ResponsiveDialogContext);
  return isDesktop ? (
    <DialogClose {...props}>{children}</DialogClose>
  ) : (
    <DrawerClose {...props}>{children}</DrawerClose>
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
};
