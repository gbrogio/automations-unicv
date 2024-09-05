import { getAllStudents } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export const dynamic = "force-dynamic";

export default async function Page() {
  const listOfDays = await getAllStudents();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {listOfDays.map((day) => (
        <Dialog key={day.id}>
          <DialogTrigger asChild>
            <Card className="relative cursor-pointer hover:bg-accent/20 transition">
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                {day.id}
              </div>
              <CardContent className="flex flex-col items-center justify-center p-6 py-10">
                <div className="text-2xl font-bold">Number of Students {day.students.length}</div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alunos que saíram mais cedo (2ºA ESW)</DialogTitle>
              <DialogDescription>Lista dos alunos que foram embora mais cedo no dia {day.id}.</DialogDescription>
            </DialogHeader>
            <ul className="grid gap-2 list-disc pl-4">
              {day.students.map((student) => (
                <li key={student.ra}>{student.full_name} - {student.ra} - {
                  new Date(student.date).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                  })
                }
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}