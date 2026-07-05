import { ReactNode } from "react";

interface FilterCheckboxGroupProps {
  title: string;
  icon?: ReactNode;
  options: string[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
}

export default function FilterCheckboxGroup({ title, icon, options, selectedValues, onChange }: FilterCheckboxGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedValues.includes(option)}
              onChange={(e) => onChange(option, e.target.checked)}
              className="rounded border-border bg-input text-primary focus:ring-primary" 
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
