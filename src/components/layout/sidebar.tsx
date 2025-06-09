import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  TrendingUp, 
  Brain, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: TrendingUp,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: Brain,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden soft-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-green-200/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0',
          'shadow-[4px_0_32px_rgba(34,197,94,0.08)]',
          isCollapsed ? '-translate-x-full' : 'translate-x-0',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-green-200/30 px-6">
            <Link to="/journal" className="flex items-center space-x-3">
              <div className="soft-logo flex h-12 w-12 items-center justify-center p-1">
                <img 
                  src="/Thymos.png" 
                  alt="Thymos" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold soft-green-text">
                Thymos
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-8">
            <nav className="space-y-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsCollapsed(true)}
                    className={cn(
                      'flex items-center space-x-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out',
                      'hover:bg-green-50/80 hover:backdrop-blur-sm hover:shadow-sm dark:hover:bg-green-900/20',
                      isActive
                        ? 'bg-gradient-to-r from-green-100/90 to-green-50/80 text-green-700 shadow-sm border border-green-200/50 dark:from-green-800/40 dark:to-green-900/30 dark:text-green-300 dark:border-green-700/30'
                        : 'text-muted-foreground hover:text-green-700 dark:hover:text-green-300'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}