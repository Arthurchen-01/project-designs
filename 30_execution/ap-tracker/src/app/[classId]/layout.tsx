import { ClassHeader } from '@/components/class-header'

interface Props {
  children: React.ReactNode
  params: Promise<{ classId: string }>
}

export default async function ClassLayout({ children, params }: Props) {
  const { classId } = await params
  return (
    <div className="min-h-screen bg-gray-50">
      <ClassHeader classId={classId} />
      <main>{children}</main>
    </div>
  )
}
