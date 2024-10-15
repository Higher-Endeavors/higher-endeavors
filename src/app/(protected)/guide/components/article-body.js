
//import parse from 'html-react-parser';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticleBody({ content }) {
  return (
    <div className="max-w-2xl mx-auto">
        <Markdown remarkPlugins={[remarkGfm]}>{ content }</Markdown>
    </div>
  )
}
