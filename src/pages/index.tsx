import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  console.log(postsPagination.results);

  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        {postsPagination.results.map(post => (
          <div className={styles.post}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div>
              <span>{post.data.author}</span>
              <span>{post.first_publication_date}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getAllByType('post');

  const posts = postsResponse.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
      },
    },
  };
};
