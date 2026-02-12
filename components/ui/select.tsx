import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

const Select = ({ value, onValueChange, disabled, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode
    id?: string
    placeholder?: string
  }
>(({ className, children, id, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  // Encontra o SelectContent e seus itens
  const content = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[]
    return childrenArray.find((child) => child.type === SelectContent)
  }, [children])

  interface SelectItemProps {
    value: string
    children: React.ReactNode
  }

  const items = React.useMemo(() => {
    if (!content) return []
    return React.Children.toArray(content.props.children) as React.ReactElement<SelectItemProps>[]
  }, [content])

  const selectedItem = React.useMemo(() => {
    return items.find((item) => {
      if (React.isValidElement(item) && item.type === SelectItem) {
        return (item.props as SelectItemProps).value === context?.value
      }
      return false
    })
  }, [items, context?.value])

  const selectedLabel = React.isValidElement(selectedItem) && selectedItem.type === SelectItem
    ? (selectedItem.props as SelectItemProps).children
    : ""

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleItemClick = (value: string) => {
    context?.onValueChange(value)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={triggerRef}>
      <button
        ref={ref}
        type="button"
        id={id}
        onClick={() => !context?.disabled && setIsOpen(!isOpen)}
        disabled={context?.disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className={cn(!selectedLabel && "text-muted-foreground")}>
          {selectedLabel || placeholder || "Selecione..."}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && content && (
        <SelectContent>
          {items.map((item, index) => {
            if (React.isValidElement(item) && item.type === SelectItem) {
              const itemProps = item.props as SelectItemProps
              return (
                <SelectItem
                  key={index}
                  value={itemProps.value}
                  onClick={() => handleItemClick(itemProps.value)}
                >
                  {itemProps.children}
                </SelectItem>
              )
            }
            return null
          })}
        </SelectContent>
      )}
    </div>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return null
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full max-h-96 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    children: React.ReactNode
    onClick?: () => void
  }
>(({ className, value, children, onClick, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const isSelected = context?.value === value

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
