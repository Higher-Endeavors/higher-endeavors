import Markdown from 'react-markdown';
import styles from './markdown-styles.module.css';

export default function ArticleBody({ content }) {
  return (
    <div className="max-w-2xl">
        <Markdown className={styles.markdown}>{ content }</Markdown>
    </div>
  )
}
