export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  accentColor: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: UserRole;
  isOnline: boolean;
  lastSeenAt: Date;
  joinedAt: Date;
  user?: User;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  status: GoalStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  goalId: string;
  progressPercent: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  goalId?: string;
  assigneeId?: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  dueDate?: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  assignee?: User;
  goal?: Goal;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
  reactions?: Reaction[];
}

export interface Comment {
  id: string;
  content: string;
  announcementId: string;
  userId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  emoji: string;
  announcementId: string;
  userId: string;
  createdAt: Date;
  user?: User;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: User;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum ActionItemStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum ActionItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationType {
  MENTION = 'MENTION',
  INVITATION = 'INVITATION',
  GOAL_ASSIGNED = 'GOAL_ASSIGNED',
  ACTION_ITEM_ASSIGNED = 'ACTION_ITEM_ASSIGNED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

// DTOs
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  accentColor?: string;
}

export interface InviteMemberDto {
  email: string;
  role: UserRole;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  dueDate?: string;
  status?: GoalStatus;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  goalId: string;
  progressPercent?: number;
  dueDate?: string;
}

export interface CreateActionItemDto {
  title: string;
  description?: string;
  workspaceId: string;
  goalId?: string;
  assigneeId?: string;
  priority?: ActionItemPriority;
  dueDate?: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  workspaceId: string;
}

export interface CreateCommentDto {
  content: string;
  announcementId: string;
  parentId?: string;
}

export interface AnalyticsData {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalActionItems: number;
  completedThisWeek: number;
  overdueCount: number;
  completionRate: number;
  weeklyProgress: {
    week: string;
    completed: number;
  }[];
}

// Socket Events
export interface SocketEvents {
  // Client -> Server
  'join:workspace': (workspaceId: string) => void;
  'leave:workspace': (workspaceId: string) => void;
  'presence:update': (isOnline: boolean) => void;
  
  // Server -> Client
  'announcement:new': (announcement: Announcement) => void;
  'announcement:updated': (announcement: Announcement) => void;
  'reaction:new': (reaction: Reaction) => void;
  'comment:new': (comment: Comment) => void;
  'goal:updated': (goal: Goal) => void;
  'action_item:updated': (actionItem: ActionItem) => void;
  'notification:new': (notification: Notification) => void;
  'presence:changed': (members: WorkspaceMember[]) => void;
}
