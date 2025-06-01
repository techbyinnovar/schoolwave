import { NextResponse } from "next/server";

const posts = [
    { id: 1, title: 'First Post', content: 'This is the first post' },
    { id: 2, title: 'Second Post', content: 'This is the second post' },
]

export const revalidate = 60;
export async function GET(request: Request, context: any) {
    const { params } = context
    return NextResponse.json({
        post: posts.find((x: any)  => x.id.toString() === params.id)
    })
}


