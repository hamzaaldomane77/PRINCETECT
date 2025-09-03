"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { SearchIcon, FilterIcon, EyeIcon, EditIcon, TrashIcon, CheckCircleIcon, XIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export interface Column {
  key: string
  label: string
  type?: 'text' | 'badge' | 'checkbox' | 'logo' | 'icon' | 'date' | 'actions'
  badgeColors?: Record<string, string>
  width?: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
}

export interface ActionButton {
  icon: React.ComponentType<{ className?: string }>
  label: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  color?: string
  hoverColor?: string
  onClick: (item: any) => void
}

export interface DataTableProps {
  data: any[]
  columns: Column[]
  actions?: ActionButton[]
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  selectable?: boolean
  pagination?: boolean
  itemsPerPageOptions?: number[]
  defaultItemsPerPage?: number
  className?: string
  tableClassName?: string
  onSelectionChange?: (selectedIds: number[]) => void
  onSearch?: (query: string) => void
  onFilter?: () => void
}

export function DataTable({
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = "Search...",
  filterable = true,
  selectable = true,
  pagination = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  defaultItemsPerPage = 5,
  className,
  tableClassName,
  onSelectionChange,
  onSearch,
  onFilter
}: DataTableProps) {
  const [searchQuery, setSearchQuery]  = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(defaultItemsPerPage)
  const [selectedRows, setSelectedRows] = React.useState<number[]>([])

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [data, searchQuery])

  // Calculate pagination
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = currentData.map(item => item.id)
      setSelectedRows(newSelected)
      onSelectionChange?.(newSelected)
    } else {
      setSelectedRows([])
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (itemId: number, checked: boolean) => {
    let newSelected: number[]
    if (checked) {
      newSelected = [...selectedRows, itemId]
    } else {
      newSelected = selectedRows.filter(id => id !== itemId)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(newSelected)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const renderCell = (item: any, column: Column) => {
    const value = item[column.key]

    switch (column.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={selectedRows.includes(item.id)}
            onChange={(e) => handleSelectRow(item.id, e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
          />
        )
      
      case 'logo':
        return (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Logo</span>
          </div>
        )
      
      case 'badge':
        if (column.badgeColors && value) {
          return (
            <Badge className={column.badgeColors[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
              {value}
            </Badge>
          )
        }
        return <Badge>{value}</Badge>
      
      case 'icon':
        return value ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-red-500" />
      
      case 'date':
        return formatDate(value)
      
      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "ghost"}
                size="sm"
                className={cn(
                  "rounded-full",
                  action.color || "text-gray-600 dark:text-gray-300",
                  action.hoverColor || "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => action.onClick(item)}
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )
      
      default:
        return value
    }
  }

  return (
    <div className={cn("space-y-6 w-full", className)}>
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-80 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {filterable && (
              <Button 
                variant="outline" 
                size="sm" 
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                onClick={onFilter}
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
                {selectedRows.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {selectedRows.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <Table className={cn("w-full", tableClassName)}>
            <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <TableRow className="border-gray-200 dark:border-gray-700">
                {selectable && (
                  <TableHead className="w-12 bg-gray-50 dark:bg-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === currentData.length && currentData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "text-center dark:text-gray-300 bg-gray-50 dark:bg-gray-900",
                      column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                      column.width && `w-${column.width}`
                    )}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, index) => (
                <TableRow key={item.id || index} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "text-center dark:text-gray-300",
                        column.align === 'left' && "text-left",
                        column.align === 'center' && "text-center"
                      )}
                    >
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage)
              setCurrentPage(1)
            }}
            className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
          />
        )}
      </div>
    </div>
  )
} 