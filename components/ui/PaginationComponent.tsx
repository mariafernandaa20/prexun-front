'use client'
import React from 'react'
import { Button } from './button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

interface PaginationProps {
  pagination: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
  setPagination: React.Dispatch<React.SetStateAction<any>>
}

export default function PaginationComponent({ pagination, setPagination }: PaginationProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
    }
  }

  const startItem = Math.min(pagination.total, (pagination.currentPage - 1) * pagination.perPage + 1)
  const endItem = Math.min(pagination.total, pagination.currentPage * pagination.perPage)

  return (
    <div className="flex flex-col lg:flex-row w-full items-center justify-between">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {pagination.total} items
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="itemsPerPage" className="text-sm">
            Items per page:
          </Label>
          <Select
            value={pagination.perPage.toString()}
            onValueChange={(value) => setPagination((prev) => ({ ...prev, perPage: parseInt(value) }))}
          >
            <SelectTrigger id="itemsPerPage" className="w-[80px]">
              <SelectValue placeholder="200" />
            </SelectTrigger>
            <SelectContent>
              {[50, 100, 200, 500].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2 lg:pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
            let pageNum
            if (pagination.lastPage <= 5) {
              pageNum = i + 1
            } else if (pagination.currentPage <= 3) {
              pageNum = i + 1
            } else if (pagination.currentPage >= pagination.lastPage - 2) {
              pageNum = pagination.lastPage - 4 + i
            } else {
              pageNum = pagination.currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={pagination.currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.lastPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
