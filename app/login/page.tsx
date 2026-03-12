"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {

const supabase = createClient()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

async function login(){
 await supabase.auth.signInWithPassword({
  email,
  password
 })
}

async function signup(){
 await supabase.auth.signUp({
  email,
  password
 })
}

return (

<div style={{padding:40}}>

<h1>Login / Sign Up</h1>

<input
placeholder="email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<br/>

<input
placeholder="password"
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<br/><br/>

<button onClick={login}>Login</button>

<button onClick={signup}>Sign Up</button>

</div>

)
}