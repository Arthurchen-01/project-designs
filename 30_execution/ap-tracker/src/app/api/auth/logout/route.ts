import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('ap_student_id', '', { maxAge: 0, path: '/' })
  response.cookies.set('ap_class_id', '', { maxAge: 0, path: '/' })
  return response
}
