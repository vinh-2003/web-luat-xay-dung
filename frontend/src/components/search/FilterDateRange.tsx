import { ReactNode } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";

interface FilterDateRangeProps {
  title: string;
  icon?: ReactNode;
  dateFrom: string;
  dateTo: string;
  onChangeFrom: (dateStr: string) => void;
  onChangeTo: (dateStr: string) => void;
}

export default function FilterDateRange({ title, icon, dateFrom, dateTo, onChangeFrom, onChangeTo }: FilterDateRangeProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="flex flex-col gap-2">
        <DatePicker
          selected={dateFrom ? parseISO(dateFrom) : null}
          onChange={(date: Date | null) => onChangeFrom(date ? format(date, "yyyy-MM-dd") : "")}
          dateFormat="dd/MM/yyyy"
          placeholderText="Từ ngày (dd/mm/yyyy)"
          className="w-full text-sm bg-input border border-border p-1.5 rounded-md focus:ring-1 focus:ring-primary outline-none"
          isClearable
        />
        <DatePicker
          selected={dateTo ? parseISO(dateTo) : null}
          onChange={(date: Date | null) => onChangeTo(date ? format(date, "yyyy-MM-dd") : "")}
          dateFormat="dd/MM/yyyy"
          placeholderText="Đến ngày (dd/mm/yyyy)"
          className="w-full text-sm bg-input border border-border p-1.5 rounded-md focus:ring-1 focus:ring-primary outline-none"
          isClearable
        />
      </div>
    </div>
  );
}
