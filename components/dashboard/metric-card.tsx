"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
  variant?: "default" | "warning" | "danger" | "success"
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  onClick,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border hover:border-primary/50",
    warning: "border-warning/30 bg-warning/5",
    danger: "border-destructive/30 bg-destructive/5",
    success: "border-success/30 bg-success/5",
  }

  const iconStyles = {
    default: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
    success: "text-success",
  }

  return (
    <Card
      className={cn("transition-all duration-200", variantStyles[variant], onClick && "cursor-pointer hover:shadow-lg")}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <span className={cn("text-xs font-medium", trend.isPositive ? "text-success" : "text-destructive")}>
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={cn("rounded-lg bg-background p-3", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
