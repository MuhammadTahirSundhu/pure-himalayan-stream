import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative overflow-hidden hover:bg-primary/10 group"
    >
      <Sun
        className={`w-5 h-5 transition-all duration-500 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
        }`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100 text-primary' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
