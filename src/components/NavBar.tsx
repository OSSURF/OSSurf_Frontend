import { Container } from './container.tsx';
import { Button } from './Button.tsx';
import { ThemeToggle } from './ThemeToggle';
import { cva } from 'class-variance-authority';
import { useTheme } from './theme-provider';

const logoOSSVariants = cva('text-3xl font-serif-instrument', {
  variants: {
    theme: {
      light: 'text-gray-900',
      dark: 'text-white',
    },
  },
});

const logoURFVariants = cva('text-3xl font-serif-instrument', {
  variants: {
    theme: {
      light: 'text-gray-600',
      dark: 'text-neutral-500',
    },
  },
});

export function NavBar() {
  const { theme } = useTheme();

  return (
    <Container>
      <div className='flex justify-between items-center border border-border border-dashed py-4 px-6 font-geist'>
        <a href='#' className='flex'>
          <span className={logoOSSVariants({ theme })}>OSS</span>
          <span className={logoURFVariants({ theme })}>URF</span>
        </a>
        <div className='flex items-center gap-3'>
          <ThemeToggle />
          <Button variant='secondary' size='md'>
            LOGIN
          </Button>
          <Button variant='primary' size='md'>
            SignUp
          </Button>
        </div>
      </div>
    </Container>
  );
}
