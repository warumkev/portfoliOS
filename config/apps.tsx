// ...existing imports and declarations...

// ...existing imports and declarations...

// ...existing code...


import { ReactNode } from 'react';
import { User, Briefcase, Mail, CircuitBoard, Music } from 'lucide-react';


// Modular section components
import AboutContent from '../components/sections/AboutContent';
import PortfolioContent from '../components/sections/PortfolioContent';
import dynamic from 'next/dynamic';
const ContactContent = dynamic(() => import('../components/sections/ContactContent'), { ssr: false });
const BlogContent = dynamic(() => import('../components/sections/BlogContent'), { ssr: false });
const SysteminfoContent = dynamic(() => import('../components/sections/SysteminfoContent'), { ssr: false });
const MusicPlayerContent = dynamic(() => import('../components/sections/MusicPlayerContent'), { ssr: false });


// Declarations for app icons and content components
export interface Project {
    icon: ReactNode;
    title: string;
    description: string;
    url: string;
}

export interface AppConfig {
    title: string;
    icon: ReactNode;
    content: ReactNode;
    defaultSize: { width: number; height: number };
    minSize?: { width: number; height: number };
}

export interface BlogPost {
    title: string;
    date: string;
    content: string;
}

// App configuration for all window sections
export const APP_CONFIG: Record<string, AppConfig> = {
    about: {
        title: 'README.md',
        icon: <User size={20} />, // adjust icon as needed
        content: <AboutContent />,
        defaultSize: { width: 420, height: 600 },
        minSize: { width: 320, height: 400 },
    },
    portfolio: {
        title: 'Portfolio',
        icon: <Briefcase size={20} />,
        content: <PortfolioContent />,
        defaultSize: { width: 520, height: 600 },
        minSize: { width: 320, height: 400 },
    },
    contact: {
        title: 'Mail',
        icon: <Mail size={20} />,
        content: <ContactContent />,
        defaultSize: { width: 420, height: 600 },
        minSize: { width: 320, height: 400 },
    },
    /*blog: {
        title: 'Notizen',
        icon: <NotebookText size={20} />,
        content: <BlogContent />,
        defaultSize: { width: 520, height: 600 },
        minSize: { width: 320, height: 400 },
    },*/
    systeminfo: {
        title: 'Settings',
        icon: <CircuitBoard size={20} />,
        content: <SysteminfoContent />,
        defaultSize: { width: 420, height: 600 },
        minSize: { width: 320, height: 400 },
    },
    music: {
        title: 'Music',
        icon: <Music size={20} />,
        content: <MusicPlayerContent />,
        defaultSize: { width: 420, height: 600 },
        minSize: { width: 320, height: 400 },
    },
};