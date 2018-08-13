import Layout from "../components/MyLayout";
import Link from "next/link";

function getPosts() {
  return [
    { id: "cgv", title: "CGV" },
    { id: "megabox", title: "MEGABOX" },
    { id: "lotte-cinema", title: "LOTTE CINEMA" }
  ];
}

export default () => (
  <Layout>
    <h1>EasyMovieSearch</h1>
    <ul>
      {getPosts().map(theater => (
        <li key={theater.id}>
          <Link as={`/${theater.id}`} href={`/theater?title=${theater.title}`}>
            <a>{theater.title}</a>
          </Link>
        </li>
      ))}
    </ul>
    <style jsx>{`
      h1,
      a {
        font-family: "Arial";
      }
      ul {
        padding: 0;
      }
      li {
        list-style: none;
        margin: 5px 0;
      }
      a {
        text-decoration: none;
        color: blue;
      }
      a:hover {
        opacity: 0.6;
      }
    `}</style>
  </Layout>
);
