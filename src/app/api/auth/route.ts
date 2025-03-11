import { NextResponse } from "next/server";
import {apiRequest} from "@/lib/api" ;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await apiRequest('login', 'POST', body);
    if(!response.token){
        throw new Error('Invalid Credentials');
    }
    return NextResponse.redirect('/dashboard');
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}