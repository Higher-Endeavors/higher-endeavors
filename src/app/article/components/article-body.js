
//import parse from 'html-react-parser';
import Markdown from 'react-markdown';

export default function ArticleBody({ content }) {
  return (
    <div className="max-w-2xl mx-auto">
        <Markdown>{ content }</Markdown>
    </div>
  )
}
