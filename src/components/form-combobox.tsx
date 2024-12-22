import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Control } from "react-hook-form";

export type ComboboxOption = {
  id: number | string;
  label: string;
};

interface FormComboboxProps {
  control: Control<any>;
  name: string;
  options: ComboboxOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  onNewItem?: () => void;
}

export function FormCombobox({
  control,
  name,
  options,
  label,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage,
  onNewItem,
}: FormComboboxProps) {
  const [open, setOpen] = useState(false);
  const getOptionById = (id: string | number) => {
    return options.find((option) => option?.id?.toString() === id?.toString());
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[350px] justify-between",
                    !field.value && "text-muted-foreground",
                    open && "invisible"
                  )}
                >
                  {getOptionById(field.value)?.label || placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[350px] p-0", open && "-mt-10")}>
              <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  {emptyMessage && (
                    <CommandEmpty className="px-4 py-2 text-sm">
                      {emptyMessage}
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.id}
                        onSelect={() => {
                          field.onChange(option.id);
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            option.id.toString() === field.value?.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                {onNewItem && (
                  <div className="text-sm border-t">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 w-full"
                      onClick={onNewItem}
                    >
                      <PlusCircle className="size-4" />
                      Create a new {label}
                    </Button>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
