"use client";

import { Search, Filter, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchFilters } from "@/types";
import { searchService } from "@/services/searchService";
import FilterCheckboxGroup from "./search/FilterCheckboxGroup";
import FilterDateRange from "./search/FilterDateRange";

export default function SearchSidebar({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    doc_types: [],
    statuses: [],
    issuing_bodies: [],
    issue_date_from: "",
    issue_date_to: "",
    effective_date_from: "",
    effective_date_to: ""
  });
  
  const [options, setOptions] = useState({
    doc_types: [] as string[],
    statuses: [] as string[],
    issuing_bodies: [] as string[]
  });

  useEffect(() => {
    searchService.getFilters()
      .then(res => setOptions(res))
      .catch(err => console.error("Lỗi tải filters:", err));
  }, []);

  const triggerSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerSearch({ ...filters, query: e.target.value });
  };

  const handleArrayChange = (field: keyof SearchFilters, value: string, checked: boolean) => {
    const currentArray = filters[field] as string[];
    const newArray = checked 
      ? [...currentArray, value] 
      : currentArray.filter((item) => item !== value);
    triggerSearch({ ...filters, [field]: newArray });
  };

  const handleDateChange = (field: keyof SearchFilters, value: string) => {
    triggerSearch({ ...filters, [field]: value });
  };

  return (
    <div id="tour-search" className="w-full h-full p-4 border-r border-border bg-card flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Tìm kiếm chi tiết</h2>
        <button 
          onClick={() => triggerSearch({
            query: "", doc_types: [], statuses: [], issuing_bodies: [],
            issue_date_from: "", issue_date_to: "", effective_date_from: "", effective_date_to: ""
          })}
          className="text-xs font-medium text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          Xóa bộ lọc
        </button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          value={filters.query}
          onChange={handleQueryChange}
          placeholder="Tiêu đề, Số hiệu, Nội dung..." 
          className="w-full bg-input border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        <FilterCheckboxGroup 
          title="Loại văn bản"
          icon={<Filter className="h-4 w-4" />}
          options={options.doc_types}
          selectedValues={filters.doc_types}
          onChange={(val, checked) => handleArrayChange("doc_types", val, checked)}
        />

        <hr className="border-border" />

        <FilterCheckboxGroup 
          title="Tình trạng hiệu lực"
          options={options.statuses}
          selectedValues={filters.statuses}
          onChange={(val, checked) => handleArrayChange("statuses", val, checked)}
        />

        <hr className="border-border" />

        <FilterCheckboxGroup 
          title="Cơ quan ban hành"
          options={options.issuing_bodies}
          selectedValues={filters.issuing_bodies}
          onChange={(val, checked) => handleArrayChange("issuing_bodies", val, checked)}
        />

        <hr className="border-border" />

        <div className="space-y-4">
          <FilterDateRange 
            title="Ngày ban hành"
            icon={<Calendar className="h-4 w-4" />}
            dateFrom={filters.issue_date_from || ""}
            dateTo={filters.issue_date_to || ""}
            onChangeFrom={(val) => handleDateChange("issue_date_from", val)}
            onChangeTo={(val) => handleDateChange("issue_date_to", val)}
          />

          <FilterDateRange 
            title="Ngày có hiệu lực"
            icon={<Calendar className="h-4 w-4" />}
            dateFrom={filters.effective_date_from || ""}
            dateTo={filters.effective_date_to || ""}
            onChangeFrom={(val) => handleDateChange("effective_date_from", val)}
            onChangeTo={(val) => handleDateChange("effective_date_to", val)}
          />
        </div>

      </div>
    </div>
  );
}
