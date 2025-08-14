import { v4 as uuidv4 } from "uuid";
import "./style.css";
import type { Post } from "./types/post";

const formElement = document.querySelector<HTMLFormElement>(".post-form")!;
const sectionPosts = document.querySelector("#posts")!;

formElement.addEventListener("submit", (event) => handleAddPost(event));
sectionPosts.addEventListener("click", (event) => handlePostClick(event));

loadPosts();

function createPostElement(post: Post): HTMLElement {
  const { id, title, content, author, created_at } = post;

  const postElement = document.createElement("article");
  postElement.id = id;
  postElement.classList.add("post");

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  titleElement.classList.add("title");
  postElement.appendChild(titleElement);

  const authorElement = document.createElement("p");
  authorElement.textContent = author;
  authorElement.classList.add("author");
  postElement.appendChild(authorElement);

  const timestampElement = document.createElement("p");
  timestampElement.textContent = created_at.toISOString();
  timestampElement.classList.add("timestamp");
  postElement.appendChild(timestampElement);

  const contentElement = document.createElement("p");
  contentElement.textContent = content;
  contentElement.classList.add("content");
  postElement.appendChild(contentElement);

  const editElement = document.createElement("a");
  editElement.innerHTML = "Edit";
  editElement.href = "#";
  editElement.classList.add("edit");
  postElement.appendChild(editElement);

  const deleteElement = document.createElement("a");
  deleteElement.innerHTML = "Delete";
  deleteElement.href = "#";
  deleteElement.classList.add("delete");
  postElement.appendChild(deleteElement);

  return postElement;
}

function handleAddPost(event: SubmitEvent) {
  event.preventDefault();

  const titleElement =
    document.querySelector<HTMLInputElement>("#title-input")!;
  const authorElement =
    document.querySelector<HTMLInputElement>("#author-input")!;
  const contentElement =
    document.querySelector<HTMLInputElement>("#content-input")!;

  if (
    titleElement.value.trim().length === 0 ||
    authorElement.value.trim().length === 0 ||
    contentElement.value.trim().length === 0
  ) {
    return;
  }

  const post: Post = {
    id: uuidv4(),
    author: authorElement.value,
    title: titleElement.value,
    content: contentElement.value,
    created_at: new Date(),
  };

  sectionPosts.insertAdjacentElement("afterbegin", createPostElement(post));

  savePost(post);

  titleElement.value = "";
  authorElement.value = "";
  contentElement.value = "";
}

function loadPosts(): Post[] {
  const posts = getPostsFromLocalStorage();
  sectionPosts.innerHTML = "";

  posts
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .forEach((post: Post) => {
      sectionPosts.appendChild(createPostElement(post));
    });

  return posts;
}

function savePost(post: Post) {
  const posts: Post[] = getPostsFromLocalStorage();
  posts.push(post);
  localStorage.setItem("posts", JSON.stringify(posts));
}

function getPostsFromLocalStorage(): Post[] {
  const savedPosts = localStorage.getItem("posts");
  if (!savedPosts) return [];

  return JSON.parse(savedPosts).map((post: any) => ({
    ...post,
    created_at: new Date(post.created_at),
  }));
}

function handlePostClick(event: Event): void {
  if (!(event.target instanceof HTMLElement)) return;

  const postElement = event.target.closest<HTMLElement>(".post");
  if (postElement === null) return;

  if (event.target.closest(".delete")) {
    event.preventDefault();
    return deletePost(postElement);
  }

  if (event.target.closest(".edit")) {
    event.preventDefault();
    return editPost(postElement);
  }
}

function deletePost(postElement: HTMLElement): void {
  sectionPosts.removeChild(postElement);

  const posts: Post[] = getPostsFromLocalStorage();
  localStorage.setItem(
    "posts",
    JSON.stringify(posts.filter((post) => post.id !== postElement.id))
  );
}

function editPost(postElement: HTMLElement): void {}
