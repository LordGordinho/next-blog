import { PrismicDocument, Query } from '@prismicio/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

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
  const [posts, setPosts] = useState<Post[]>([...postsPagination.results]);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const handleNextPosts = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const next_posts: Query<
      PrismicDocument<Record<string, any>, string, string>
    > = await response.json();

    const new_posts = next_posts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'Q LLL yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: RichText.asText(post.data.title),
          subtitle: RichText.asText(post.data.subtitle),
          author: RichText.asText(post.data.author),
        },
      };
    });

    setPosts([...posts, ...new_posts]);
    setNextPage(next_posts.next_page);
  };

  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <h2>{post.data.subtitle}</h2>
              <div className={commonStyles.metadatas}>
                <div className={commonStyles.metadataItem}>
                  <FiCalendar />
                  <span>{post.first_publication_date}</span>
                </div>
                <div className={commonStyles.metadataItem}>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {nextPage && (
        <button
          onClick={handleNextPosts}
          type="button"
          className={styles.nextPostsBtn}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 1,
    lang: '*',
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'Q LLL yyyy',
        {
          locale: ptBR,
        }
      ),
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
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
