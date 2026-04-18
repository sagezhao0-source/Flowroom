import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Task {
  id: string;
  title: string;
  sourceLink?: string;
  deadline?: string;
  reminderTime?: string;
  reminderMessage?: string;
  status: "pending" | "completed";
  completedAt?: string;
  tags?: string[];
  completionProof?: {
    description?: string;
    imageUrl?: string;
  };
}

export interface DailyStats {
  date: string;
  completed: number;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, proof?: { description?: string; imageUrl?: string }) => void;
  getDailyStats: () => DailyStats[];
  getCompletedCount: () => number;
  getPendingCount: () => number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = "productivity-room-tasks";

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getInitialTasks();
      }
    }
    return getInitialTasks();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (
          task.status === "pending" &&
          task.reminderTime &&
          task.reminderMessage
        ) {
          const reminderDate = new Date(task.reminderTime);
          const diff = reminderDate.getTime() - now.getTime();

          // Show notification if within 1 minute of reminder time
          if (diff > 0 && diff < 60000) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(task.title, {
                body: task.reminderMessage,
                icon: "/icon.png",
              });
            } else {
              alert(`${task.title}\n\n${task.reminderMessage}`);
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Check immediately

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const completeTask = (id: string, proof?: { description?: string; imageUrl?: string }) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "completed",
              completedAt: new Date().toISOString(),
              completionProof: proof
            }
          : task
      )
    );
  };

  const getDailyStats = (): DailyStats[] => {
    const stats = new Map<string, number>();
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      stats.set(dateStr, 0);
    }

    // Count completed tasks
    tasks
      .filter((task) => task.status === "completed" && task.completedAt)
      .forEach((task) => {
        const dateStr = task.completedAt!.split("T")[0];
        if (stats.has(dateStr)) {
          stats.set(dateStr, (stats.get(dateStr) || 0) + 1);
        }
      });

    return Array.from(stats.entries())
      .map(([date, completed]) => ({ date, completed }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getCompletedCount = () =>
    tasks.filter((task) => task.status === "completed").length;

  const getPendingCount = () =>
    tasks.filter((task) => task.status === "pending").length;

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getDailyStats,
        getCompletedCount,
        getPendingCount,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
}

function getInitialTasks(): Task[] {
  return [
    {
      id: "1",
      title: "React Hooks Best Practices",
      sourceLink: "https://react.dev/reference/react",
      status: "pending",
      tags: ["Frontend", "React"],
    },
    {
      id: "2",
      title: "Advanced TypeScript Techniques",
      sourceLink: "https://typescript.org/docs",
      status: "pending",
      tags: ["Frontend", "TypeScript"],
    },
    {
      id: "3",
      title: "Tailwind CSS Color Schemes",
      sourceLink: "https://tailwindcss.com/docs",
      status: "pending",
      tags: ["Design", "CSS"],
    },
  ];
}
