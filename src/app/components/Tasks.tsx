import { useState, useMemo } from "react";
import { useTasks, Task } from "../context/TaskContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Tag, Calendar, Clock, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { TaskDetail } from "./TaskDetail";

export function Tasks() {
  const { tasks, addTask, deleteTask, updateTask, completeTask } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => task.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((task) => task.tags?.includes(selectedTag));
    }

    return filtered.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "pending" ? -1 : 1;
    });
  }, [tasks, searchQuery, selectedTag]);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  return (
    <>
      <div className="min-h-full p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl mb-2">Collection</h1>
            <p className="text-muted-foreground">
              Your skill library and guide repository
            </p>
          </div>

          <div className="mb-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or tag..."
              className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm rounded-3xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {allTags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedTag === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/60 text-muted-foreground hover:bg-white"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/60 text-muted-foreground hover:bg-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-primary text-primary-foreground rounded-3xl p-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
            animate={{
              boxShadow: [
                "0 4px 12px -4px rgba(212, 184, 232, 0.3)",
                "0 4px 16px -4px rgba(212, 184, 232, 0.5)",
                "0 4px 12px -4px rgba(212, 184, 232, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Plus className="w-5 h-5" />
            <span>New</span>
          </motion.button>

          <AnimatePresence>
            {isAdding && (
              <AddTaskForm
                onSave={(task) => {
                  addTask(task);
                  setIsAdding(false);
                }}
                onCancel={() => setIsAdding(false)}
              />
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTaskId(task.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredTasks.length === 0 && !isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                {searchQuery || selectedTag
                  ? "No matching items found"
                  : "No items yet. Add your first skill or guide!"}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onUpdate={(updates) => updateTask(selectedTask.id, updates)}
            onDelete={() => deleteTask(selectedTask.id)}
            onComplete={(proof) => completeTask(selectedTask.id, proof)}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      whileHover={{
        scale: task.status === "pending" ? 1.02 : 1.01,
        boxShadow: task.status === "pending"
          ? "0 8px 24px -8px rgba(212, 184, 232, 0.4)"
          : "0 4px 12px -4px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-3xl p-5 shadow-sm border transition-all relative overflow-hidden ${
        task.status === "completed"
          ? "bg-white/30 backdrop-blur-sm border-border/50 opacity-50"
          : "bg-white/60 backdrop-blur-sm border-border"
      }`}
    >
      {task.status === "pending" && (
        <motion.div
          className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-secondary"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <h3 className="mb-2 text-foreground">{task.title}</h3>

      <div className="flex flex-wrap gap-2 mb-2">
        {task.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary-foreground rounded-full text-xs"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {task.deadline && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(task.deadline), "MMM d")}</span>
          </div>
        )}
        {task.reminderTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(task.reminderTime), "MMM d, HH:mm")}</span>
          </div>
        )}
      </div>

      {task.status === "pending" && (
        <motion.div
          className="mt-3 text-xs text-primary flex items-center gap-1"
          animate={{
            x: [0, 4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span>Tap to view</span>
          <span>→</span>
        </motion.div>
      )}
    </motion.button>
  );
}

interface AddTaskFormProps {
  onSave: (task: Omit<Task, "id">) => void;
  onCancel: () => void;
}

function AddTaskForm({ onSave, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      sourceLink: sourceLink || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      reminderTime: reminderTime ? new Date(reminderTime).toISOString() : undefined,
      reminderMessage: reminderMessage || undefined,
      tags: tags.length > 0 ? tags : undefined,
      status: "pending",
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 shadow-lg border border-border mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3>New Item</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2 text-muted-foreground">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., React Hooks Best Practices"
            className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Source Link (optional)
          </label>
          <input
            type="url"
            value={sourceLink}
            onChange={(e) => setSourceLink(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Tags (optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter tag and press Enter"
              className="flex-1 px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Deadline (optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Reminder Time (optional)
          </label>
          <input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">
            Reminder Message (optional)
          </label>
          <textarea
            value={reminderMessage}
            onChange={(e) => setReminderMessage(e.target.value)}
            placeholder="A motivational message for yourself..."
            rows={3}
            className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This message will show when the reminder triggers
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 hover:opacity-90 transition-opacity"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-muted text-muted-foreground rounded-2xl py-3 hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
