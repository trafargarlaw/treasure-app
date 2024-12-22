import { cn } from "@/lib/utils";
import { useFocusRing } from "@react-aria/focus";
import { useListBox, useOption } from "@react-aria/listbox";
import { mergeProps } from "@react-aria/utils";
import { ComboBoxState } from "@react-stately/combobox";
import { Node } from "@react-types/shared";
import { RefObject, useRef } from "react";

interface ListBoxProps<T> {
  state: ComboBoxState<T>;
  className?: string;
  listBoxRef?: RefObject<HTMLUListElement>;
}

interface OptionProps<T> {
  item: Node<T>;
  state: ComboBoxState<T>;
}

export default function ListBox<T extends object>(props: ListBoxProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  const { listBoxRef = ref, state } = props;
  const { listBoxProps } = useListBox(
    {
      ...props,
      disabledKeys: state.disabledKeys,
    },
    state,
    listBoxRef
  );

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      className={cn(
        "max-h-[300px] overflow-auto p-1",
        "outline-none",
        props.className
      )}
    >
      {[...state.collection].map((item) => (
        <Option<T> key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

function Option<T extends object>({ item, state }: OptionProps<T>) {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isFocused, isDisabled } = useOption(
    { key: item.key },
    state,
    ref
  );
  const { focusProps } = useFocusRing();

  return (
    <li
      {...mergeProps(optionProps, focusProps)}
      ref={ref}
      className={cn(
        "relative flex items-center rounded-sm px-2 py-1.5 text-sm outline-none cursor-default",
        {
          "bg-primary text-primary-foreground": isSelected,
          "bg-accent": isFocused && !isSelected,
          "opacity-50": isDisabled,
        }
      )}
    >
      {item.rendered}
    </li>
  );
}
