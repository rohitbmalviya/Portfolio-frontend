// ============================================================
//  RichTextSection — free MDX/rich-text block.
//  Renders body as markdown via react-markdown.
//  Server component.
// ============================================================

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { SectionHeading } from '@/components/ui/section-heading';
import type { RichTextData } from '@/lib/types';

interface RichTextSectionProps {
  data: RichTextData;
  sectionNumber?: string;
}

export function RichTextSection({ data, sectionNumber }: RichTextSectionProps) {
  return (
    <section className="py-16" aria-labelledby={data.heading ? 'rich-text-heading' : undefined}>
      <div className="wrap">
        {data.heading && (
          <SectionHeading number={sectionNumber} title={data.heading} />
        )}
        <div className="prose max-w-[72ch]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, rehypeHighlight]}
          >
            {data.body}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
