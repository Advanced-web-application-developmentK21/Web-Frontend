export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavItemGroup = {
  title?: string;
  menuList: SideNavItem[];
};
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null; // ISO string for simplicity
  priority: "low" | "medium" | "high";
  status: "overdue" | "inprogress" | "completed";
}

export interface TaskCategory {
  name: string;
  tasks: Task[];
}
