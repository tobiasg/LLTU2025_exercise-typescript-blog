import "./style.css";

interface IPost {
  id: string;
  title: string;
  author: string;
  content: string;
  created_at: Date;
}

let posts: IPost[] = [];

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <main>
    <section class="post-form-section">
      <form class="post-form">
        <label for="title-input">Title</label>
          <input type="text" id="title-input" class="title-input" name="title">
          <label for="author-input">Author</label> 
          <input type="text" id="author-input" class="author-input" name="author">
          <label for="content-input">Content</label>
          <textarea id="content-input" class="content-input" name="content"></textarea>
          <button type="submit">Create Post</button>
      </form>
    </section>
    <section id="posts"></section>
  </main>
`;

const sectionPosts = document.querySelector("#posts")!;

posts.forEach((post) => {
  sectionPosts.appendChild(createPostElement(post));
});

function createPostElement(post: IPost): HTMLElement {
  const { id, title, content, author, created_at } = post;

  const postElement = document.createElement("article");
  postElement.id = `post-${id}`;
  postElement.classList.add("post");

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  postElement.appendChild(titleElement);

  const authorElement = document.createElement("p");
  authorElement.textContent = author;
  postElement.appendChild(authorElement);

  const timestampElement = document.createElement("p");
  timestampElement.textContent = created_at.toLocaleDateString();
  postElement.appendChild(timestampElement);

  const contentElement = document.createElement("p");
  contentElement.textContent = content;
  postElement.appendChild(contentElement);

  sectionPosts.appendChild(postElement);

  return postElement;
}
