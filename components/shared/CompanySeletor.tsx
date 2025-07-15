import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUser } from "@clerk/nextjs"
import { CheckIcon, ChevronDown, ChevronsUpDown } from "lucide-react"
import  createClerkSupabaseClient  from "@/app/supabase/supabasecClient"
import { cn } from "@/lib/utils"  

interface CompanySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CompanySeletor = ({ value, onChange }: CompanySelectorProps) => {
    const {user} = useUser()
    const [loading, setLoading] = useState(true)
    //const [selectedCompany, setSelectedCompany] = useState<string>("")
    const [Companies,setCompanies] = useState<any[]>([])
    const supabase = createClerkSupabaseClient()
    const [open, setOpen] = React.useState(false)

    useEffect(() => {
        if (!user) return

        async function loadCompanies() {
            setLoading(true)
            const { data, error } = await supabase.from('companies').select('id,companyname')
            if (!error) setCompanies(data)
            setLoading(false)
        }

        loadCompanies()
    }, [user])

  return (
    <div>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-0 justify-between"
        >
          {value || "Select Company..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-0 p-0">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandList>
            <CommandEmpty>No Company found.</CommandEmpty>
            <CommandGroup>
              {Companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.companyname}
                    onSelect={(currentValue) => {
                      if (onChange) {
                        onChange(currentValue === value ? "" : currentValue);
                      }
                      setOpen(false);
                    }}
                  >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.companyname ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.companyname}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover></div>
  )
}

export default CompanySeletor