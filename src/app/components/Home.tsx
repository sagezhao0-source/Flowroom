import { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Upload } from "lucide-react";

export function Home() {
  const { tasks, completeTask, getCompletedCount } = useTasks();
  const pendingTasks = tasks.filter((t) => t.status === "pending").slice(0, 6);
  const completedCount = getCompletedCount();
  const [completingId, setCompletingId] = useState<string | null>(null);

  return (
    <div className="h-full relative overflow-hidden">
      {/* Room background */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Wall */}
          <rect x="0" y="0" width="800" height="480" fill="#e8d8f0" />

          {/* Floor */}
          <path
            d="M 0 480 L 0 800 L 800 800 L 800 480 Q 400 500 0 480"
            fill="#d8e8d3"
          />

          {/* Window */}
          <g opacity="0.4">
            <rect
              x="580"
              y="100"
              width="160"
              height="200"
              rx="12"
              fill="#d3e4f0"
              stroke="#b0cfe8"
              strokeWidth="8"
            />
            <line
              x1="660"
              y1="100"
              x2="660"
              y2="300"
              stroke="#b0cfe8"
              strokeWidth="6"
            />
            <line
              x1="580"
              y1="200"
              x2="740"
              y2="200"
              stroke="#b0cfe8"
              strokeWidth="6"
            />
          </g>
        </svg>

      </div>

      {/* Task bubbles */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-2xl aspect-square">
          <AnimatePresence>
            {pendingTasks.map((task, index) => (
              <TaskBubble
                key={task.id}
                task={task}
                index={index}
                total={pendingTasks.length}
                onComplete={() => setCompletingId(task.id)}
              />
            ))}
          </AnimatePresence>

          {pendingTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <Sparkles className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-2xl text-center text-foreground mb-2">
                Room Complete!
              </h2>
              <p className="text-muted-foreground text-center">
                Add new skills to continue decorating
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Completion counter */}
      <div className="absolute top-8 left-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-lg rounded-3xl px-6 py-3 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">Mastered</p>
          <p className="text-3xl text-foreground">{completedCount}</p>
        </motion.div>
      </div>

      {/* Completion dialog */}
      <AnimatePresence>
        {completingId && (
          <CompletionDialog
            onSubmit={(proof) => {
              completeTask(completingId, proof);
              setCompletingId(null);
            }}
            onCancel={() => setCompletingId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TaskBubbleProps {
  task: { id: string; title: string };
  index: number;
  total: number;
  onComplete: () => void;
}

function TaskBubble({ task, index, total, onComplete }: TaskBubbleProps) {
  const positions = getBubblePositions(total);
  const position = positions[index];

  return (
    <motion.button
      layoutId={task.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: position.x,
        y: position.y,
      }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onComplete}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
      }}
    >
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur-sm flex items-center justify-center p-6 shadow-lg border-4 border-white/50">
          <p className="text-center text-sm text-primary-foreground leading-tight">
            {task.title}
          </p>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      </div>
    </motion.button>
  );
}

function getBubblePositions(count: number) {
  const positions = [
    { x: 0, y: -80 },
    { x: 100, y: -40 },
    { x: -100, y: -40 },
    { x: 60, y: 60 },
    { x: -60, y: 60 },
    { x: 0, y: 100 },
  ];
  return positions.slice(0, count);
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
