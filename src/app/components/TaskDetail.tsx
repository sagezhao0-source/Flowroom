import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Calendar, Tag, Trash2, CheckCircle2, Clock, Upload, ArrowLeft } from "lucide-react";
import { Task } from "../context/TaskContext";
import { format } from "date-fns";

interface TaskDetailProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onComplete: (proof?: { description?: string; imageUrl?: string }) => void;
  onClose: () => void;
}

export function TaskDetail({ task, onUpdate, onDelete, onComplete, onClose }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        onSave={(updates) => {
          onUpdate(updates);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <div className="min-h-full p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-2xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-opacity"
            >
              Edit
            </button>
          </div>

          {/* Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border mb-6">
            <h1 className="text-3xl mb-4">{task.title}</h1>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="space-y-3 mb-6">
              {task.sourceLink && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ExternalLink className="w-5 h-5" />
                  <a
                    href={task.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors underline"
                  >
                    Link
                  </a>
                </div>
              )}

              {task.deadline && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>Deadline: {format(new Date(task.deadline), "MMM d, yyyy")}</span>
                </div>
              )}

              {task.reminderTime && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>
                    Reminder: {format(new Date(task.reminderTime), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>

            {/* Reminder Message */}
            {task.reminderMessage && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Reminder Message:</p>
                <p className="text-foreground italic text-left">"{task.reminderMessage}"</p>
              </div>
            )}

            {/* Completion Proof */}
            {task.status === "completed" && task.completionProof && (
              <div className="bg-primary/10 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Completion Proof:</p>
                {task.completionProof.description && (
                  <p className="text-foreground mb-3">{task.completionProof.description}</p>
                )}
                {task.completionProof.imageUrl && (
                  <img
                    src={task.completionProof.imageUrl}
                    alt="Completion proof"
                    className="w-full max-h-64 object-cover rounded-2xl"
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Guides */}
          {task.status === "pending" && (
            <div className="space-y-3">
              <motion.button
                onClick={() => setShowCompleteDialog(true)}
                className="w-full bg-gradient-to-br from-primary to-secondary text-white rounded-3xl p-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  scale: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xl">Complete Now</span>
                </div>
                <p className="text-sm opacity-90">Tap here to mark as done</p>
              </motion.button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-muted-foreground p-4 hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  <span>Remove</span>
                </div>
              </button>
            </div>
          )}

          {task.status === "completed" && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-muted-foreground p-4 hover:text-foreground transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Remove</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Complete Dialog */}
      <AnimatePresence>
        {showCompleteDialog && (
          <CompletionDialog
            onSubmit={(proof) => {
              onComplete(proof);
              setShowCompleteDialog(false);
              onClose();
            }}
            onCancel={() => setShowCompleteDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmation
            onConfirm={() => {
              onDelete();
              onClose();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface TaskEditFormProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
  onClose: () => void;
}

function TaskEditForm({ task, onSave, onCancel, onClose }: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [sourceLink, setSourceLink] = useState(task.sourceLink || "");
  const [deadline, setDeadline] = useState(
    task.deadline ? task.deadline.split("T")[0] : ""
  );
  const [reminderTime, setReminderTime] = useState(
    task.reminderTime ? task.reminderTime.slice(0, 16) : ""
  );
  const [reminderMessage, setReminderMessage] = useState(task.reminderMessage || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(task.tags || []);

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
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="min-h-full p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Hooks Best Practices"
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
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
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will show when the reminder triggers
              </p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

interface CompletionDialogProps {
  onSubmit: (proof: { description?: string; imageUrl?: string }) => void;
  onCancel: () => void;
}

function CompletionDialog({ onSubmit, onCancel }: CompletionDialogProps) {
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description: description.trim() || undefined,
      imageUrl: imagePreview || imageUrl || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 shadow-2xl border border-border max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3>Add Completion Proof</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Show what you've accomplished or learned
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you learned or accomplished..."
              rows={4}
              className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Upload Image (optional)
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-input-background rounded-2xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Choose image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-muted-foreground">
              Or paste image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              disabled={!!imagePreview}
              className="w-full px-4 py-3 bg-input-background rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 hover:opacity-90 transition-opacity"
          >
            Submit
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
    </motion.div>
  );
}

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 shadow-2xl border border-border max-w-sm w-full"
      >
        <h3 className="mb-2">Remove this item?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-muted-foreground text-white rounded-2xl py-3 hover:opacity-90 transition-opacity"
          >
            Remove
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-muted text-muted-foreground rounded-2xl py-3 hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
