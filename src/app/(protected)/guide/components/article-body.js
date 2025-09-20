import Markdown from 'react-markdown';
import styles from '(protected)/guide/components/markdown-styles.module.css';

export default function ArticleBody({ content }) {
  return (
    <div className="max-w-3xl px-8">
        <Markdown className={styles.markdown}>{ content }</Markdown>
    </div>
  )
}
