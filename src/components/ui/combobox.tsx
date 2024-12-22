import { cn } from "@/lib/utils";
import { useButton } from "@react-aria/button";
import { useComboBox } from "@react-aria/combobox";
import {
  ComboBoxStateOptions,
  useComboBoxState,
} from "@react-stately/combobox";
import { Key } from "@react-types/shared";
import { ChevronsUpDown } from "lucide-react";
import { useRef } from "react";
import { Button } from "./button";
import ListBox from "./listbox";

interface ComboBoxProps<T extends object> extends ComboBoxStateOptions<T> {
  className?: string;
  inputClassName?: string;
  listBoxClassName?: string;
  onInputChange?: (value: string) => void;
  allowCustomValue?: boolean;
}

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  const {
    onInputChange,
    allowCustomValue = true,
    onSelectionChange: propOnSelectionChange,
    ...otherProps
  } = props;

  const state = useComboBoxState({
    ...otherProps,
    allowsCustomValue: allowCustomValue,
    onSelectionChange: (key: Key | null) => {
      propOnSelectionChange?.(key);
      if (key) {
        const selectedItem = state.collection.getItem(key);
        onInputChange?.(selectedItem?.textValue || "");
      }
    },
    onInputChange: (value) => {
      onInputChange?.(value);
    },
    defaultFilter: (textValue, inputValue) => {
      return textValue.toLowerCase().includes(inputValue.toLowerCase());
    },
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    buttonProps: buttonAriaProps,
    inputProps: originalInputProps,
    listBoxProps,
  } = useComboBox(
    {
      ...otherProps,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  const inputProps = {
    ...originalInputProps,
  };

  const { buttonProps } = useButton(buttonAriaProps, buttonRef);

  return (
    <div className={cn("relative inline-flex flex-col gap-1", props.className)}>
      <div className="relative inline-flex">
        <input
          {...inputProps}
          ref={inputRef}
          className={cn(
            "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            props.inputClassName
          )}
        />
        <Button
          {...buttonProps}
          ref={buttonRef}
          variant="ghost"
          className="absolute right-0 h-full px-2 hover:bg-transparent"
        >
          <ChevronsUpDown className="size-4" />
        </Button>
      </div>
      {state.isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <ListBox<T>
            {...listBoxProps}
            listBoxRef={listBoxRef}
            state={state}
            className={props.listBoxClassName}
          />
        </div>
      )}
    </div>
  );
}
