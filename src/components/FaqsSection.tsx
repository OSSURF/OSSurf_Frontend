import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Container } from './container';

export function FaqsSection() {
  return (
    <Container className='border-border border-x border-dashed'>
      <div className='w-full'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <div className='space-y-4 px-6 pt-12 pb-4 md:border-r border-dashed border-border'>
            <h2 className='text-3xl font-geist'>FAQs</h2>
            <p className='text-muted-foreground font-geist-mono text-sm'>
              Here are some common questions and answers about SourceSurf and
              how it helps you discover and contribute to open source projects.
            </p>
          </div>
          <div className='place-content-center'>
            <Accordion collapsible defaultValue='item-1' type='single'>
              {questions.map((item) => (
                <AccordionItem
                  className='last:border-b border-dashed data-[state=open]:bg-card border-border'
                  key={item.id}
                  value={item.id}
                >
                  <AccordionTrigger className='px-4 py-4 text-[15px] leading-6 hover:no-underline font-geist'>
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className='px-4 pb-4 text-muted-foreground font-geist-mono text-sm'>
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </Container>
  );
}

const questions = [
  {
    id: 'item-1',
    title: 'What is SourceSurf?',
    content:
      'SourceSurf is a platform that helps developers discover and contribute to open source projects faster. Instead of spending minutes searching through GitHub, you can surface relevant OSS projects in seconds with focused context, manage PRs and issues, and track contributions all in one workspace.',
  },
  {
    id: 'item-2',
    title: 'How does SourceSurf help me discover OSS projects?',
    content:
      'SourceSurf provides a streamlined interface to find the right open source projects quickly. You get focused context on repositories, real-time updates on pull requests and issues, and can track activity across multiple projects without switching between tabs.',
  },
  {
    id: 'item-3',
    title: 'What features does SourceSurf include?',
    content:
      'SourceSurf offers real-time notifications for PR and issue updates, a global contributors map showing OSS activity worldwide, seamless GitHub integration, unified workspace for managing multiple repositories, and powerful search to find the right projects instantly.',
  },
  {
    id: 'item-4',
    title: 'How do I get started with SourceSurf?',
    content:
      "Getting started is simple! Click the 'Get Started' button, connect your GitHub account, and you'll immediately have access to a curated feed of OSS projects. You can start tracking repositories, managing PRs, and discovering new projects to contribute to right away.",
  },
  {
    id: 'item-5',
    title: 'Does SourceSurf integrate with GitHub?',
    content:
      'Yes! SourceSurf deeply integrates with GitHub to provide real-time updates on pull requests, issues, and repository activity. You can view, track, and manage your GitHub contributions without leaving the platform.',
  },
  {
    id: 'item-6',
    title: 'Can I track multiple repositories at once?',
    content:
      'Absolutely. SourceSurf is designed to help you manage multiple open source projects in a single workspace. You can track PRs, issues, and contributions across all your repositories with real-time notifications and centralized management.',
  },
];
