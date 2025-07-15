// components/JobFilters.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { State } from "country-state-city";
import createClerkSupabaseClient from "@/app/supabase/supabasecClient";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "../ui/label";

export type JobFiltersState = {
  search: string;
  company: string;
  location: string;
  jobtype: string[];
  workplace: string;
};

export default function JobFilters({
  filters,
  setFilters,
  onClear,
}: {
  filters: JobFiltersState;
  setFilters: (f: JobFiltersState) => void;
  onClear?: () => void;
}) {
  // Default filter state for clearing
  const defaultFilters: JobFiltersState = {
    search: "",
    company: "",
    location: "",
    jobtype: [],
    workplace: "",
  };

  const handleClear = () => {
    if (onClear) onClear();
    else setFilters(defaultFilters);
  };

  // All job types and workplaces as in PostJobForm
  const jobTypes = [
    "Full Time",
    "Part Time",
    "Internship",
    "Contract",
    "Volunteer",
    "Other",
  ];
  const workplaces = [
    "On-site",
    "Remote",
    "Hybrid",
  ];

  // All Indian states for location
  const states = State.getStatesOfCountry("IN");

  // Create supabase client at the top level (NOT inside useEffect)
  const supabase = createClerkSupabaseClient();
  const [companies, setCompanies] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase.from("postjob").select("company");
      if (!error && data) {
        const unique = Array.from(new Set(data.map((row: any) => row.company).filter(Boolean)));
        setCompanies(unique);
      }
    }
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col justify-between h-[80vh] min-h-[500px] bg-gray-50 dark:bg-zinc-900 rounded-xl p-2 sm:p-4 shadow w-full max-w-md mx-auto sm:max-w-none sm:mx-0 sm:sticky sm:top-6 sm:h-[80vh] sm:w-96 lg:w-96 flex-shrink-0 border border-gray-200 dark:border-zinc-800">
      {/* Company filter with search at the top */}
      {/* Replace this: */}

        {/* With this, broken into sections */}
        <div className="space-y-6 flex-1">
        {/* Company filter with Popover */}
        <div>
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={companyOpen}
                className="w-full justify-between"
                >
                {filters.company || "Select Company..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-0 p-0">
                <Command>
                <CommandInput placeholder="Search company..." value={companySearch} onValueChange={setCompanySearch} />
                <CommandList>
                    <CommandEmpty>No Company found.</CommandEmpty>
                    <CommandGroup>
                    {companies
                        .filter(c => c.toLowerCase().includes(companySearch.toLowerCase()))
                        .map((company) => (
                        <CommandItem
                            key={company}
                            value={company}
                            onSelect={(currentValue) => {
                            setFilters({ ...filters, company: currentValue === filters.company ? "" : currentValue });
                            setCompanyOpen(false);
                            }}
                        >
                            <CheckIcon className={cn("mr-2 h-4 w-4", filters.company === company ? "opacity-100" : "opacity-0")} />
                            {company}
                        </CommandItem>
                    ))}
                    </CommandGroup>
                </CommandList>
                </Command>
            </PopoverContent>
            </Popover>
        </div>

        {/* Search */}
        <Input
            className="w-full"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Location */}
        <Select
            value={filters.location}
            onValueChange={(val) => setFilters({ ...filters, location: val })}
        >
            <SelectTrigger className="w-full"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
            {states.map((state) => (
                <SelectItem key={state.name} value={state.name}>{state.name}</SelectItem>
            ))}
            </SelectContent>
        </Select>

        {/* Job Type */}
        <div>
            <Label className="text-sm mb-1 block">Job Type</Label>
            <div className="flex flex-wrap gap-2">
            {jobTypes.map((type) => (
                <label key={type} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer border transition-colors
                ${filters.jobtype.includes(type)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-zinc-700'}`}
                >
                <Checkbox
                    checked={filters.jobtype.includes(type)}
                    onCheckedChange={(checked) => {
                    setFilters({
                        ...filters,
                        jobtype: checked
                        ? [...filters.jobtype, type]
                        : filters.jobtype.filter((t) => t !== type),
                    });
                    }}
                    className="border-gray-300 dark:border-zinc-700"
                />
                <span>{type}</span>
                </label>
            ))}
            </div>
        </div>

        {/* Workplace */}
        <div>
            <Label className="text-sm mb-1 block">Workplace</Label>
            <ToggleGroup
            type="single"
            value={filters.workplace}
            onValueChange={(val) => setFilters({ ...filters, workplace: val })}
            className="w-full flex gap-2"
            >
            {workplaces.map((type) => (
                <ToggleGroupItem
                key={type}
                value={type}
                className={`flex-1 px-4 py-2 rounded border transition-colors
                    ${filters.workplace === type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-zinc-700'}`}
                >
                {type}
                </ToggleGroupItem>
            ))}
            </ToggleGroup>
        </div>
        </div>

        {/* Clear Filters button pinned at bottom */}
        <div className="pt-4">
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleClear}
        >
            Clear Filters
        </Button>
        </div>

      </div>
  );
}
