import * as React from "react";

import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface CopyButtonProps {
  value: string;
  children?: React.ReactNode;
}

export async function copyToClipboardWithMeta(value: string) {
  await navigator.clipboard.writeText(value);
}

export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <TooltipProvider delayDuration={10}>
      <Tooltip>
        <TooltipTrigger
          onClick={async (e) => {
            e.stopPropagation();
            await copyToClipboardWithMeta(value);
            setHasCopied(true);
          }}
          tabIndex={-1}
          {...props}
          className="flex items-center gap-2"
        >
          {props.children}
          <span className="sr-only">Copy</span>
          {hasCopied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent side="right">
          {hasCopied ? "Copied!" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
