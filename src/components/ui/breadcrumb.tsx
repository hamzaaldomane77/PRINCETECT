"use client"

import * as React from "react"
import { ChevronRightIcon, HomeIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400", className)}
    >
      <ol className="flex items-center space-x-1 rtl:space-x-reverse">
        <li>
          <a
            href="/super-admin"
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 mx-1 text-gray-400 dark:text-gray-500" />
            {item.href && index < items.length - 1 ? (
              <a
                href={item.href}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 