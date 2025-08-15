"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps, useState, useEffect } from "react";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  pending?: boolean; // Nuevo prop opcional
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  pending,
  ...props
}: Props) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (typeof pending === "boolean") {
      setIsPending(pending);
    }
  }, [pending]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pending === undefined) {
      setIsPending(true); // solo controla el estado interno si no viene prop
    }

    const form = e.currentTarget.form;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      aria-disabled={isPending}
      {...props}
    >
      {isPending ? pendingText : children}
    </Button>
  );
}
