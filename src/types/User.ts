export interface User {
    id: string;
    name: string;
    email: string;
}

export interface UserProfile extends User {
    bio?: string;
    avatarUrl?: string;
}
export interface UserSettings {
    theme: "light" | "dark";
    notificationsEnabled: boolean;
}
