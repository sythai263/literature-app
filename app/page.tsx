import { createClient } from '@/lib/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: lessons } = await supabase.from('lessons').select('*')

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-slate-900">
          NGỮ VĂN TOÀN DIỆN
        </h1>
        <p className="text-slate-500 text-lg italic">Hệ thống học liệu phi ngôn ngữ thời gian thực</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons?.map((lesson) => (
          <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="transition-transform hover:-translate-y-1">
            <Card className="overflow-hidden border-none shadow-xl ring-1 ring-slate-200">
              <img src={lesson.image_url} className="aspect-video w-full object-cover" />
              <CardHeader>
                <Badge className="w-fit mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100">Bài giảng</Badge>
                <CardTitle className="text-xl">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2">{lesson.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}