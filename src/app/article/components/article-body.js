
//import parse from 'html-react-parser';
import Markdown from 'react-markdown';

export default function ArticleBody({ content }) {
  console.log("Body: ", content);
  return (
    <div className="max-w-2xl mx-auto">
        {/* {parse(content)} */}
        <Markdown>{ content }</Markdown>
    </div>
  )
}
