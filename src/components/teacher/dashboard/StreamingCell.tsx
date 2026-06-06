import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Play, Square, ExternalLink, AlertTriangle, LinkIcon } from "lucide-react"
import {
  getStreamingState,
  type StreamingInputClass,
} from "@/lib/streamingStatus"

interface Props {
  classItem: StreamingInputClass
  now: Date
  startedAt?: number | null
  endedAt?: number | null
  onStart: (id: string) => void
  onEnd: (id: string) => void
}

export function StreamingCell({ classItem, now, startedAt, endedAt, onStart, onEnd }: Props) {
  const state = getStreamingState(classItem, now, startedAt, endedAt)
  const url = classItem.assignments?.urlView

  const open = () => url && window.open(url, "_blank")

  switch (state.kind) {
    case "upcoming":
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" disabled className="h-8">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Upcoming
              </Button>
            </TooltipTrigger>
            <TooltipContent>Starts in {formatRelative(state.startsInMs)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )


    case "start":
      return (
        <Button
          size="sm"
          onClick={() => {
            onStart(classItem.id)
            open()
          }}
          className="h-8 bg-success hover:bg-success/90 text-white relative"
        >
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <Play className="h-3.5 w-3.5 mr-1" />
          Start
        </Button>
      )

    case "ongoing":
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-success/15 text-success border-success/30 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Ongoing
          </Badge>
          {url && (
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={open}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Join
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-muted-foreground"
            onClick={() => onEnd(classItem.id)}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            End
          </Button>
        </div>
      )

    case "overrun":
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-warning/40 text-warning gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overrun
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2"
            onClick={() => onEnd(classItem.id)}
          >
            End class
          </Button>
        </div>
      )

    case "ended":
      return (
        <Badge variant="secondary" className="gap-1">
          Ended
          {state.endedEarly && (
            <span className="text-xs text-muted-foreground">(early)</span>
          )}
        </Badge>
      )


    case "cancelled":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Cancelled
        </Badge>
      )

    case "noLink":
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" disabled className="h-8">
                <LinkIcon className="h-3.5 w-3.5 mr-1" />
                No link
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a meeting link in Schedule to enable Start</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
  }
}
