import { Field } from "@canonical/react-components";
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
  disabled?: boolean | string;
};

type Props = {
  name: string;
  label: ReactNode;
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  searchable?: "always" | "never";
};

type DropdownProps = {
  name: string;
  options: CustomSelectOption[];
  value: string;
  searchable: boolean;
  listboxId: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

const firstEnabledIndex = (options: CustomSelectOption[]) =>
  options.findIndex((option) => !option.disabled);

function CustomSelectDropdown({
  name,
  options,
  value,
  searchable,
  listboxId,
  onSelect,
  onClose,
}: DropdownProps): JSX.Element {
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLLIElement[]>([]);

  const query = search.trim().toLowerCase();
  const filteredOptions = options.filter(
    (option) =>
      !query || option.disabled || option.label.toLowerCase().includes(query),
  );

  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    const selectedIndex = options.findIndex(
      (option) => option.value === value && !option.disabled,
    );
    return selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(options);
  });

  useEffect(() => {
    if (searchable) searchRef.current?.focus();
    else dropdownRef.current?.focus();
  }, [searchable]);

  useEffect(() => {
    optionsRef.current[highlightedIndex]?.scrollIntoView?.({
      block: "nearest",
    });
  }, [highlightedIndex]);

  const getNextIndex = (goingUp: boolean, previousIndex: number) => {
    const increment = goingUp ? -1 : 1;
    let index = previousIndex + increment;
    while (filteredOptions[index]?.disabled) index += increment;
    return filteredOptions[index] ? index : previousIndex;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "Enter", "Escape", "Tab"].includes(event.key))
      return;
    // Keep keys from submitting the form or closing an enclosing modal.
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      setHighlightedIndex((index) =>
        getNextIndex(event.key === "ArrowUp", index),
      );
      return;
    }
    if (event.key === "Enter") {
      const option = filteredOptions[highlightedIndex];
      if (option && !option.disabled) onSelect(option.value);
      return;
    }
    onClose();
  };

  const handleSearch = (nextSearch: string) => {
    const nextQuery = nextSearch.trim().toLowerCase();
    setSearch(nextSearch);
    optionsRef.current = [];
    setHighlightedIndex(
      firstEnabledIndex(
        options.filter(
          (option) =>
            !nextQuery ||
            option.disabled ||
            option.label.toLowerCase().includes(nextQuery),
        ),
      ),
    );
  };

  const optionId = (index: number) => `${listboxId}-option-${index}`;

  return (
    <div
      className="p-custom-select__dropdown u-no-padding"
      ref={dropdownRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <div className="p-custom-select__search u-no-padding--bottom">
          <input
            ref={searchRef}
            id={`select-search-${name}`}
            name={`select-search-${name}`}
            type="search"
            className="u-no-margin--bottom"
            aria-label={`Search for ${name}`}
            aria-controls={listboxId}
            aria-activedescendant={
              filteredOptions[highlightedIndex]
                ? optionId(highlightedIndex)
                : undefined
            }
            placeholder="Search"
            autoComplete="off"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>
      )}
      <ul className="p-list u-no-margin--bottom" role="listbox" id={listboxId}>
        {filteredOptions.map((option, index) => (
          <li
            key={`${option.value}-${index}`}
            id={optionId(index)}
            ref={(element) => {
              if (element) optionsRef.current[index] = element;
            }}
            role="option"
            aria-selected={option.value === value}
            aria-disabled={Boolean(option.disabled)}
            className={`p-list__item p-custom-select__option u-truncate${
              option.disabled ? " disabled" : ""
            }${index === highlightedIndex && !option.disabled ? " highlight" : ""}`}
            onClick={() => {
              if (!option.disabled) onSelect(option.value);
            }}
            onMouseMove={() => setHighlightedIndex(index)}
          >
            <span className={option.disabled ? "u-text--muted" : undefined}>
              {option.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CustomSelect({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  searchable = "never",
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const toggleId = useId();
  const validationId = useId();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const closeWhenHidden = () => {
      if (document.visibilityState === "hidden") close();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("visibilitychange", closeWhenHidden);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("visibilitychange", closeWhenHidden);
      window.removeEventListener("blur", close);
    };
  }, [isOpen]);

  const closeDropdown = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <Field
      className="p-custom-select"
      error={error}
      forId={toggleId}
      isSelect
      label={label}
      required={required}
      validationId={validationId}
    >
      <div className="p-custom-select__wrapper" ref={wrapperRef}>
        <button
          ref={toggleRef}
          id={toggleId}
          name={name}
          type="button"
          className={`p-custom-select__toggle p-form-validation__input${
            isOpen ? " active" : ""
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-invalid={Boolean(error)}
          aria-errormessage={error ? validationId : undefined}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="toggle-label u-truncate">
            {selectedOption?.label ?? "Select an option"}
          </span>
        </button>
        {isOpen && !disabled && (
          <CustomSelectDropdown
            name={name}
            options={options}
            value={value}
            searchable={searchable === "always" && options.length > 1}
            listboxId={listboxId}
            onSelect={(nextValue) => {
              closeDropdown();
              onChange(nextValue);
            }}
            onClose={closeDropdown}
          />
        )}
      </div>
    </Field>
  );
}

export default CustomSelect;
