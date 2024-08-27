
import parse from 'html-react-parser';

export default function ArticleBody({ content }) {
  return (
    <div className="max-w-2xl mx-auto">
        {parse(content)}
    </div>
  )
}
