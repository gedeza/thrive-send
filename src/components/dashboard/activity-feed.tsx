"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { Button } from "@/components/ui/button"

export interface Activity {
  id: string
  type: "campaign" | "email" | "user" | "system"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    image?: string
  }
}

interface ActivityFeedProps {
  activities: Activity[]
}

// Safe version of ActivityFeed with error handling
const SafeActivityFeed: React.FC<ActivityFeedProps> = (props) => (
  <ErrorBoundary
    fallback={
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-destructive">Error Loading Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              An error occurred while loading the activity feed.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    }
  >
    <ActivityFeed {...props} />
  </ErrorBoundary>
)

export function ActivityFeed({ activities: initialActivities }: ActivityFeedProps) {
  const { error, handleError } = useErrorHandler({
    fallbackMessage: 'Failed to load activity feed',
  });

  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [filter, setFilter] = useState<Activity["type"] | "all">("all")
  const [loading, setLoading] = useState(false)

  // Fetch real activity data from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/activity')
        if (response.ok) {
          const data = await response.json()
          if (data.activities && Array.isArray(data.activities)) {
            setActivities(data.activities)
          }
        } else {
          console.warn('Failed to fetch activities:', response.statusText)
        }
      } catch (error) {
        handleError(error)
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Set up periodic refresh for real-time updates - INCREASED to 15 minutes to reduce API load
    const interval = setInterval(fetchActivities, 900000) // Refresh every 15 minutes
    return () => clearInterval(interval)
  }, [handleError])

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter((activity) => activity.type === filter)

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "campaign":
        return "bg-primary"
      case "email":
        return "bg-secondary"
      case "user":
        return "bg-accent"
      case "system":
        return "bg-muted"
      default:
        return "bg-muted"
    }
  }

  if (error.hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-destructive">Error Loading Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            Real-time updates from your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          Real-time updates from your campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Badge
            variant="outline"
            className={`cursor-pointer ${
              filter === "all" 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${
              filter === "campaign" 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted"
            }`}
            onClick={() => setFilter("campaign")}
          >
            Campaigns
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${
              filter === "email" 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted"
            }`}
            onClick={() => setFilter("email")}
          >
            Emails
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${
              filter === "user" 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-muted"
            }`}
            onClick={() => setFilter("user")}
          >
            Users
          </Badge>
        </div>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.image} alt={activity.user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default SafeActivityFeed 