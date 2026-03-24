// task and subtasks types for consistent usage across components
export type Task = {
    text: string;
    duration: number;
    id: string;
    date: string;
    subTasks: SubTask[];
    priority: Priority;
};

export type SubTask = {
    text: string;
    completed: boolean;
    id: string;
};

export type Priority = "low" | "med" | "high" | "urgent";

export type Reward = { title: string; cost: number; id: string; };

// rituals types for consistent usage across components
export type Ritual = { 
    id: string; 
    text: string; 
    completed: boolean; 
    lastCompletedDate: string; 
};