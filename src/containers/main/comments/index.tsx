import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, MessageSquare, MoreHorizontal, Pencil, Send, Trash2, X } from "lucide-react";
import useComments from "./useHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import DataNotFound from "@/components/particles/table/data-not-found";

const PAGE_SIZE = 20;

type ProjectOption = {
  id: string;
  siteName: string;
  client?: { id?: string; fullName?: string } | null;
};

type CommentItem = {
  id: string;
  message: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  isDeleted?: boolean;
  userId: string;
  user?: { id?: string; fullName?: string; email?: string } | null;
};

export default function Comments() {
  const { session, hasPermission } = usePermissions();
  const { getProjects, fetchCommentsPage, addComment, updateComment, deleteComment } =
    useComments();
  const canCreate =
    hasPermission(PERMISSIONS.COMMENTS_CREATE) ||
    hasPermission(PERMISSIONS.CONSTRUCTION_SITE_READ);

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) || null,
    [projects, projectId],
  );

  useEffect(() => {
    getProjects((items: ProjectOption[]) => {
      setProjects(items);
      if (items.length === 1) {
        setProjectId(items[0].id);
      }
    });
  }, []);

  const commentsRef = useRef<CommentItem[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  commentsRef.current = comments;

  const toChronological = (items: CommentItem[]) =>
    [...items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  const mergeNewest = (prev: CommentItem[], latestNewestFirst: CommentItem[]) => {
    const latest = toChronological(latestNewestFirst);
    const latestIds = new Set(latest.map((item) => item.id));
    const older = prev.filter((item) => !latestIds.has(item.id));
    return [...older, ...latest];
  };

  const focusLatestMessage = () => {
    requestAnimationFrame(() => {
      const node = threadRef.current;
      if (!node) return;
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "auto",
      });
    });
  };

  const loadLatest = async (id: string, scroll = false) => {
    if (!id) {
      setComments([]);
      setTotalElements(0);
      setHistoryOffset(0);
      return;
    }
    const { data, total } = await fetchCommentsPage(id, { offset: 0, limit: PAGE_SIZE });
    setTotalElements(total);
    setHistoryOffset(data.length);
    setComments(toChronological(data));
    if (scroll) {
      lastMessageIdRef.current = data[0]?.id || null;
      setTimeout(() => focusLatestMessage(), 50);
    }
  };

  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    const timer = window.setTimeout(() => {
      document.addEventListener("click", close);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", close);
    };
  }, [menuOpenId]);

  const pollComments = async (id: string) => {
    if (!id || document.visibilityState === "hidden" || editingId) return;
    const { data, total } = await fetchCommentsPage(id, { offset: 0, limit: PAGE_SIZE });
    setTotalElements(total);
    setComments((prev) => mergeNewest(prev, data));
  };

  useEffect(() => {
    const last = comments[comments.length - 1];
    if (!last) {
      lastMessageIdRef.current = null;
      return;
    }
    if (lastMessageIdRef.current && lastMessageIdRef.current !== last.id) {
      focusLatestMessage();
    }
    lastMessageIdRef.current = last.id;
  }, [comments]);

  useEffect(() => {
    setComments([]);
    setTotalElements(0);
    setHistoryOffset(0);
    lastMessageIdRef.current = null;
    loadLatest(projectId, true);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const refresh = () => pollComments(projectId);
    const intervalId = window.setInterval(refresh, 5000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [projectId, editingId]);

  const handleLoadMore = async () => {
    if (!projectId || loadingMore) return;
    setLoadingMore(true);
    const { data, total } = await fetchCommentsPage(projectId, {
      offset: historyOffset,
      limit: PAGE_SIZE,
    });
    setTotalElements(total);
    const older = toChronological(data);
    setComments((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      return [...older.filter((item) => !existing.has(item.id)), ...prev];
    });
    setHistoryOffset((current) => current + data.length);
    setLoadingMore(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !message.trim() || !canCreate) return;
    setSubmitting(true);
    const created = await addComment(projectId, message.trim());
    if (created) {
      setMessage("");
      if (typeof created === "object" && created.id) {
        setComments((prev) =>
          prev.some((item) => item.id === created.id) ? prev : [...prev, created],
        );
        setTotalElements((current) => current + 1);
      } else {
        await pollComments(projectId);
      }
    }
    setSubmitting(false);
  };

  const isEdited = (comment: CommentItem) => {
    if (!comment.updated_at) return false;
    return new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 2000;
  };

  const startEdit = (comment: CommentItem) => {
    setMenuOpenId(null);
    setEditingId(comment.id);
    setEditText(comment.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setSavingEdit(false);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim() || savingEdit) return;
    setSavingEdit(true);
    const ok = await updateComment(id, editText.trim());
    setSavingEdit(false);
    if (ok) {
      cancelEdit();
      setComments((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, message: editText.trim(), updated_at: new Date().toISOString() }
            : item,
        ),
      );
    }
  };

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    const ok = await deleteComment(id);
    if (ok) {
      setComments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isDeleted: true, deleted_at: new Date().toISOString(), message: "" } : item,
        ),
      );
    }
  };

  const formatDateTime = (value: string) => {
    try {
      return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-10rem)] min-h-[420px]">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Project Comments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep a transparent conversation between the client and the GharPlans team.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className="mb-2 block ui-form-label">Project</label>
          <select
            className="common-input bg-card"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
            }}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.siteName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!projectId ? (
        <div className="bg-card border border-border-main rounded-xl p-10 text-center">
          <MessageSquare className="mx-auto text-muted-foreground mb-3" size={28} />
          <p className="text-sm text-muted-foreground">
            Select a project to view and add comments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-stretch min-h-0 flex-1">
          <div className="bg-card border border-border-main rounded-xl shadow-xs overflow-hidden flex flex-col min-h-0">
            <div className="px-5 py-4 border-b border-border-main/60 shrink-0">
              <h2 className="text-base font-bold text-foreground">
                {selectedProject?.siteName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedProject?.client?.fullName
                  ? `Client: ${selectedProject.client.fullName}`
                  : "Conversation thread"}
              </p>
            </div>

            <div ref={threadRef} className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {comments.length < totalElements ? (
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="h-9 px-4 rounded-md border border-border-main bg-card text-sm font-semibold text-foreground hover:bg-muted-foreground/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </div>
              ) : null}
              {comments.length ? (
                comments.map((comment, index) => {
                  const isMine = comment.userId === session?.id || comment.user?.id === session?.id;
                  const isDeleted = Boolean(comment.isDeleted || comment.deleted_at);
                  const isEditing = editingId === comment.id;
                  const isLatest = index === comments.length - 1;
                  return (
                    <div
                      key={comment.id}
                      ref={isLatest ? lastMessageRef : undefined}
                      className={`group relative rounded-xl border px-4 py-3 ${
                        isMine
                          ? "border-primary/20 bg-primary/5 ml-6"
                          : "border-border-main bg-muted-foreground/5 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-sm font-semibold text-foreground">
                          {comment.user?.fullName || comment.user?.email || "User"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatDateTime(comment.created_at)}
                            {!isDeleted && isEdited(comment) ? " · Edited" : ""}
                          </span>
                          {isMine && !isEditing && !isDeleted ? (
                            <div className="relative">
                              <button
                                type="button"
                                className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                onClick={() =>
                                  setMenuOpenId((current) =>
                                    current === comment.id ? null : comment.id,
                                  )
                                }
                                title="Message options"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {menuOpenId === comment.id ? (
                                <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border-main bg-card shadow-lg py-1">
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted-foreground/5 flex items-center gap-2 cursor-pointer"
                                    onClick={() => startEdit(comment)}
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleDelete(comment.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {isDeleted ? (
                        <p className="text-sm italic text-muted-foreground">
                          This message was deleted
                        </p>
                      ) : isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                saveEdit(comment.id);
                              }
                              if (event.key === "Escape") cancelEdit();
                            }}
                            rows={3}
                            className="common-input min-h-[72px] resize-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="h-8 px-3 rounded-md text-sm font-semibold text-muted-foreground hover:bg-muted-foreground/10 flex items-center gap-1 cursor-pointer"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingEdit || !editText.trim()}
                              onClick={() => saveEdit(comment.id)}
                              className="h-8 px-3 rounded-md bg-primary text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Check size={14} />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {comment.message}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <DataNotFound show={true} />
              )}
            </div>

            {canCreate ? (
              <form
                onSubmit={handleSubmit}
                className="border-t border-border-main/60 p-4 flex items-end gap-3 shrink-0 bg-card"
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (!submitting && message.trim()) {
                        handleSubmit(event);
                      }
                    }
                  }}
                  placeholder="Write a comment for this project... Press Enter to send"
                  rows={3}
                  className="common-input min-h-[84px] resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex h-10 px-4 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Send size={15} />
                  Send
                </button>
              </form>
            ) : null}
          </div>

          <div className="bg-muted-foreground/5 border border-border-main rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">What this is for</h3>
            <p className="text-sm text-muted-foreground leading-6">
              Clients and the GharPlans team can share updates, payment questions, and
              site progress in one place. Comments stay attached to this project only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
