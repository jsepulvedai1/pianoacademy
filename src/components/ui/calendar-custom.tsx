"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  isBefore,
  startOfDay
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarCustomProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
}

export function CalendarCustom({
  className,
  selected,
  onSelect,
  disabled
}: CalendarCustomProps) {
  // Estado para el mes que se está visualizando
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Navegación de meses
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  // Generación de días
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Semana empieza en Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate
  let formattedDate = ""

  // Generar todos los días a mostrar (incluyendo días del mes anterior/siguiente para completar semanas)
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  // Días de la semana (Encabezados)
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]

  return (
    <div className={cn("p-4 w-full max-w-[400px] mx-auto", className)}>
      {/* Header: Mes y Navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }), 
            "h-8 w-8 p-0 bg-transparent hover:bg-accent border-none shadow-none"
          )}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="font-semibold capitalize text-base">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </div>

        <button
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }), 
            "h-8 w-8 p-0 bg-transparent hover:bg-accent border-none shadow-none"
          )}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid de Días de la Semana */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-sm font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de Días */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isDisabled = disabled ? disabled(day) : false
          const isSelected = selected ? isSameDay(day, selected) : false
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isTodayDate = isToday(day)

          return (
            <button
              key={day.toString()}
              disabled={isDisabled}
              onClick={() => onSelect && !isDisabled && onSelect(day)}
              className={cn(
                "h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all relative",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && !isSelected && !isDisabled && "hover:bg-accent hover:text-accent-foreground text-foreground",
                isSelected && "bg-primary text-primary-foreground shadow-md font-medium z-10 scale-105",
                isDisabled && "text-muted-foreground/30 cursor-not-allowed opacity-50",
                isTodayDate && !isSelected && "bg-accent/30 font-medium text-primary border border-primary/20",
              )}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, dateFormat)}
              </time>
              {isSelected && (
                 <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
