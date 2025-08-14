// @/app/profile/page.tsx
"use client"

import Image from "next/image"
import { Edit, Calendar, History, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingDialog } from "@/components/profile/rating-dialog"
import { sessions } from "@/lib/mock-data"
import type { Session } from "@/lib/types"

export default function ProfilePage() {
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status !== 'scheduled');

  const SessionRow = ({ session }: { session: Session }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={session.tutor.imageUrl} alt={session.tutor.name} data-ai-hint="person" />
            <AvatarFallback>{session.tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{session.tutor.name}</div>
            <div className="text-sm text-muted-foreground">{session.course}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{new Date(session.date).toLocaleDateString()}</TableCell>
      <TableCell className="hidden md:table-cell">{session.time}</TableCell>
      <TableCell>
        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="capitalize bg-green-100 text-green-800">
            {session.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {session.status === 'completed' && <RatingDialog />}
      </TableCell>
    </TableRow>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary">
            <Image
              src="https://placehold.co/200x200.png"
              alt="User profile picture"
              fill
              className="object-cover"
              data-ai-hint="person student"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Your Name</h2>
            <p className="text-muted-foreground">student.name@mail.udp.cl</p>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="scheduled">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scheduled">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>
                Here are your scheduled tutoring sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledSessions.length > 0 ? (
                    scheduledSessions.map(session => <SessionRow key={session.id} session={session} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No upcoming sessions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>
                View your completed or cancelled sessions. Don't forget to rate your tutors!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {pastSessions.length > 0 ? (
                    pastSessions.map(session => <SessionRow key={session.id} session={session} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No past sessions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
