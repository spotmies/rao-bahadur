"use client";

import { useState, useTransition } from "react";
import { deleteTheory, deleteComment } from "../../actions";
import { Trash2, FileText, MessageSquare, AlertCircle } from "lucide-react";

type Theory = {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  upvotes: number;
  _count?: {
    comments: number;
  };
};

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  upvotes: number;
  parentId: string | null;
  theory: {
    title: string;
  };
};

type Props = {
  initialTheories: Theory[];
  initialComments: Comment[];
};

export default function AdminDashboard({ initialTheories, initialComments }: Props) {
  const [activeTab, setActiveTab] = useState<"theories" | "comments">("theories");
  const [isPending, startTransition] = useTransition();

  const handleDeleteTheory = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this theory? This action cannot be undone.")) return;
    
    startTransition(async () => {
      const res = await deleteTheory(id);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  const handleDeleteComment = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) return;
    
    startTransition(async () => {
      const res = await deleteComment(id);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Manage user theories and comments.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("theories")}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === "theories" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} />
            Theories
            <span className="ml-2 bg-zinc-800 text-zinc-300 py-0.5 px-2 rounded-full text-xs">
              {initialTheories.length}
            </span>
          </div>
          {activeTab === "theories" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === "comments" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            Comments & Replies
            <span className="ml-2 bg-zinc-800 text-zinc-300 py-0.5 px-2 rounded-full text-xs">
              {initialComments.length}
            </span>
          </div>
          {activeTab === "comments" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100" />
          )}
        </button>
      </div>

      <div className="border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm rounded-sm overflow-hidden">
        <div className="border-b border-zinc-800 p-6 flex items-center justify-between bg-zinc-900/20">
          <h2 className="font-mono text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} /> Data Log
          </h2>
          <span className="text-xs font-mono text-zinc-600">
            {activeTab === "theories" ? initialTheories.length : initialComments.length} recorded events
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "theories" ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/10">
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal">Author</th>
                  <th className="p-4 font-normal">Date</th>
                  <th className="p-4 font-normal">Comments</th>
                  <th className="p-4 font-normal">Upvotes</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-zinc-300">
                {initialTheories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">No theories found.</td>
                  </tr>
                ) : (
                  initialTheories.map((item) => (
                    <tr key={item.id} className={`border-b border-zinc-800/50 transition-colors ${isPending ? 'opacity-50' : 'hover:bg-zinc-900/50'}`}>
                      <td className="p-4 text-white/90 truncate max-w-[200px]" title={item.title}>
                        {item.title}
                      </td>
                      <td className="p-4 text-zinc-400">{item.author}</td>
                      <td className="p-4 tabular-nums text-zinc-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 tabular-nums">{item._count?.comments || 0}</td>
                      <td className="p-4 tabular-nums">{item.upvotes}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteTheory(item.id)}
                          disabled={isPending}
                          className="text-red-400/80 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-sm"
                          title="Delete Theory"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/10">
                  <th className="p-4 font-normal">Text</th>
                  <th className="p-4 font-normal">Author</th>
                  <th className="p-4 font-normal">Theory</th>
                  <th className="p-4 font-normal">Type</th>
                  <th className="p-4 font-normal">Date</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-zinc-300">
                {initialComments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">No comments found.</td>
                  </tr>
                ) : (
                  initialComments.map((item) => (
                    <tr key={item.id} className={`border-b border-zinc-800/50 transition-colors ${isPending ? 'opacity-50' : 'hover:bg-zinc-900/50'}`}>
                      <td className="p-4 text-white/90 truncate max-w-[250px]" title={item.text}>
                        {item.text}
                      </td>
                      <td className="p-4 text-zinc-400">{item.author}</td>
                      <td className="p-4 text-zinc-500 truncate max-w-[150px]" title={item.theory?.title}>
                        {item.theory?.title || "Unknown"}
                      </td>
                      <td className="p-4 text-zinc-400">
                        {item.parentId ? (
                          <span className="text-[10px] uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded-sm text-zinc-300">Reply</span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider bg-zinc-800/50 px-2 py-1 rounded-sm text-zinc-400">Comment</span>
                        )}
                      </td>
                      <td className="p-4 tabular-nums text-zinc-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteComment(item.id)}
                          disabled={isPending}
                          className="text-red-400/80 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-sm"
                          title="Delete Comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
