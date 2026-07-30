"use client";
import { useTransition } from "react";
import { deleteComment, moderateComment } from "./actions";
export function CommentActions({ id, reply, status }: { id: string; reply: boolean; status: string }) { const [pending, start] = useTransition(); return <div className="flex gap-2 text-xs">{status === "published" ? <button disabled={pending} onClick={() => start(() => moderateComment(id, reply, "hidden"))} className="text-amber-600">Hide</button> : <button disabled={pending} onClick={() => start(() => moderateComment(id, reply, "published"))} className="text-emerald-600">Restore</button>}<button disabled={pending} onClick={() => { if (window.confirm("Delete this comment?")) start(() => deleteComment(id, reply)); }} className="text-red-600">Delete</button></div>; }
