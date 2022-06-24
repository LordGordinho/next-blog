import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <main className={styles.container}>
      <img
        src={`${post.data.banner.url}`}
        alt="Banner"
        className={styles.banner}
      />
      <article className={styles.post}>
        <h1>{post.data.title}</h1>
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
        {post.data.content.map(content => {
          return (
            <div className={styles.content}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.body }} />
            </div>
          );
        })}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug));

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'Q LLL yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content: response.data.content.map(content => {
        return {
          heading: RichText.asText(content.heading),
          body: RichText.asHtml(content.body),
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
