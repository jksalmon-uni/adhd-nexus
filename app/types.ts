export type Task = {
  text: string;
  duration: number;
  id: string;
  date: string;
  subTasks: SubTask[];
  priority: Priority;
};
export type SubTask = { text: string; completed: boolean; id: string };
export type Priority = "low" | "med" | "high" | "urgent";
export type Reward = {
  title: string;
  cost: number;
  id: string;
  duration: number;
};
export type Ritual = {
  id: string;
  text: string;
  completed: boolean;
  lastCompletedDate: string;
};
export type Theme = "light" | "dark" | "system";
export type ClaimedReward = { instanceId: string; title: string; duration: number; claimedAt: string; used: boolean; };
export type CustomWishlistItem = { id: string; title: string; };
