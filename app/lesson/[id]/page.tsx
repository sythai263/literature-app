'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/client'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, PlusCircle, ArrowLeft, Image as ImageIcon, FileText, Map } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const lessonId = resolvedParams.id
  const supabase = createClient()

  const [lesson, setLesson] = useState<any>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    const { data: l } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
    const { data: c } = await supabase.from('contributions').select('*').eq('lesson_id', lessonId).order('votes', { ascending: false })
    setLesson(l)
    setContributions(c || [])
  }

  useEffect(() => { loadData() }, [lessonId])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const type = formData.get('material_type') as string
    const thoughts = formData.get('thoughts') as string

    try {
      let publicUrl = ""

      // Chỉ upload nếu có file
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`
        const { error: err } = await supabase.storage.from('materials').upload(fileName, file)
        if (err) throw err
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(fileName)
        publicUrl = urlData.publicUrl
      }

      await supabase.from('contributions').insert([{
        lesson_id: lessonId,
        student_name: name,
        material_type: type,
        image_url: publicUrl,
        thoughts: thoughts,
        votes: 0
      }])

      toast.success("Đã gửi đóng góp thành công!")
      setOpen(false)
      loadData()
    } catch (error: any) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!lesson) return <div className="h-screen flex items-center justify-center">Đang nạp dữ liệu...</div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Tác phẩm */}
        <div className="lg:col-span-1">
          <div className="sticky top-10">
            <h1 className="text-3xl font-bold mb-4 text-slate-900">{lesson.title}</h1>
            <p className="text-slate-600 leading-relaxed italic border-l-4 border-blue-200 pl-4">
              {lesson.description}
            </p>
          </div>
        </div>

        {/* Học liệu */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <h2 className="text-2xl font-bold">Kho học liệu học sinh</h2>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <PlusCircle className="w-5 h-5 mr-2" /> Đóng góp bài làm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gửi học liệu mới</DialogTitle>
                  <DialogDescription>Chia sẻ cảm nghĩ hoặc phương tiện học tập của bạn.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4" onSubmit={handleUpload}>
                  <Input name="name" placeholder="Họ và tên của bạn" required />

                  <Select name="material_type" defaultValue="image">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại học liệu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Hình ảnh minh họa</SelectItem>
                      <SelectItem value="mindmap">Sơ đồ tư duy</SelectItem>
                      <SelectItem value="video">Clip ngắn/Tư liệu</SelectItem>
                      <SelectItem value="text">Cảm nghĩ/Phân tích</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea name="thoughts" placeholder="Cảm nghĩ hoặc ý nghĩa sơ đồ (Bắt buộc)..." required />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Đính kèm ảnh (Nếu có)</label>
                    <Input type="file" name="file" accept="image/*" />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Đang gửi..." : "Xác nhận nộp bài"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {contributions.map((c) => (
              <Card key={c.id} className="group overflow-hidden flex flex-col shadow-sm border-slate-100">
                {/* Ảnh (Nếu có) */}
                {c.image_url ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={c.image_url} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center border-b italic text-slate-400 text-xs">
                    Không có ảnh đính kèm
                  </div>
                )}

                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-700 text-sm uppercase">{c.student_name}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                      {c.material_type === 'mindmap' ? 'Sơ đồ' : c.material_type === 'image' ? 'Ảnh' : 'Khác'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-snug line-clamp-4 flex-grow italic mb-4">
                    "{c.thoughts}"
                  </p>

                  {/* Vote Button - Đưa xuống dưới */}
                  <div className="pt-3 border-t mt-auto flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 -ml-2"
                      onClick={async () => {
                        await supabase.from('contributions').update({ votes: c.votes + 1 }).eq('id', c.id)
                        toast.success("Đã ghi nhận bình chọn!")
                        loadData()
                      }}
                    >
                      <Heart className="w-4 h-4 mr-1.5 fill-red-500 text-red-500" />
                      <span className="font-bold">{c.votes} hữu ích</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}