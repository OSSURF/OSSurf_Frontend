import { Container } from './container.tsx';
import { Button } from './Button.tsx';
import BentoGrid from './BentoGrid';

export function Features() {
  return (
    <Container className=''>
      <div className='flex flex-col border-x border-dashed border-border pt-8 gap-4 items-center'>
        <div className='flex gap-2 px-6 flex-col items-center'>
          <Button variant='secondary' size='sm' className='text-xl'>
            Features
          </Button>
          <h1 className='text-3xl font-geist'>Features</h1>
          <p className='text-xs sm:text-sm text-neutral-400 font-geist-mono'>
            Everything you need to discover, track, and contribute to open
            source faster
          </p>
        </div>
        <BentoGrid />
      </div>
    </Container>
  );
}
