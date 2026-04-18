import { useTasks } from "../context/TaskContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { motion } from "motion/react";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";

export function Stats() {
  const { getDailyStats, getCompletedCount, getPendingCount, tasks } = useTasks();
  const dailyStats = getDailyStats();
  const completedCount = getCompletedCount();
  const pendingCount = getPendingCount();

  const completedToday = tasks.filter(
    (task) =>
      task.status === "completed" &&
      task.completedAt &&
      new Date(task.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const todayDate = new Date().toISOString().split("T")[0];
  const chartData = dailyStats.map((stat, index) => ({
    date: format(new Date(stat.date), "EEE"),
    completed: stat.completed,
    fullDate: stat.date,
    uniqueId: `${stat.date}-${stat.completed}-${index}`,
    fill: stat.date === todayDate ? "#d4b8e8" : "#e8d8f0",
  }));

  const maxCompleted = Math.max(...dailyStats.map((s) => s.completed), 5);

  return (
    <div className="min-h-full p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Stats</h1>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Mastered"
            value={completedCount}
            color="bg-primary"
            delay={0}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Learning"
            value={pendingCount}
            color="bg-accent"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Today"
            value={completedToday}
            color="bg-secondary"
            delay={0.2}
          />
        </div>

        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border"
        >
          <h2 className="mb-6">Weekly Progress</h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8a8a9a", fontSize: 14 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8a8a9a", fontSize: 14 }}
                domain={[0, maxCompleted]}
                allowDecimals={false}
              />
              <Bar dataKey="completed" radius={[12, 12, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${entry.fullDate}-${idx}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Items completed in the last 7 days
          </p>
        </motion.div>

        {/* Calendar heatmap preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border"
        >
          <h2 className="mb-6">Activity Heatmap</h2>
          <div className="grid grid-cols-7 gap-2">
            {dailyStats.map((stat, index) => {
              const intensity = stat.completed === 0 ? 0 : Math.min(stat.completed / 3, 1);
              const bgColor = getHeatmapColor(intensity);

              return (
                <div key={`${stat.date}-${stat.completed}-heatmap-${index}`} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full aspect-square rounded-xl transition-all hover:scale-110"
                    style={{ backgroundColor: bgColor }}
                    title={`${format(new Date(stat.date), "MMM d")}: ${stat.completed} tasks`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(stat.date), "EEE")}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-6"
        >
          <h3 className="mb-2">Keep going! 🌟</h3>
          <p className="text-muted-foreground">
            You've mastered {completedCount} skill{completedCount !== 1 ? "s" : ""}.
            {pendingCount > 0 && ` ${pendingCount} more to go!`}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-border"
    >
      <div className={`${color} w-10 h-10 rounded-2xl flex items-center justify-center mb-3 text-white`}>
        {icon}
      </div>
      <p className="text-3xl mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function getHeatmapColor(intensity: number): string {
  if (intensity === 0) return "#f3f3f5";
  if (intensity < 0.33) return "#e8d8f0";
  if (intensity < 0.66) return "#d4b8e8";
  return "#b89cd8";
}
