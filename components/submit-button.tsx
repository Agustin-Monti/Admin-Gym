"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps, useState } from "react";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPending(true);

    // Si hay un form padre, lo dejamos enviar el form
    const form = e.currentTarget.form;
    if (form) {
      form.requestSubmit();
    }

    // Luego de enviar el form, puedes hacer cosas extra si quieres
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
