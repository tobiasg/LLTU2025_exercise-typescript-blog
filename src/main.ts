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

  const postHeaderElement = document.createElement("div");
  postHeaderElement.classList.add("header");

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  titleElement.classList.add("title");
  postHeaderElement.appendChild(titleElement);

  const timestampElement = document.createElement("p");
  timestampElement.textContent = created_at.toDateString();
  timestampElement.classList.add("timestamp");
  postHeaderElement.appendChild(timestampElement);

  postElement.appendChild(postHeaderElement);

  const authorElement = document.createElement("p");
  authorElement.textContent = author;
  authorElement.classList.add("author");
  postElement.appendChild(authorElement);

  const contentElement = document.createElement("p");
  contentElement.textContent = content;
  contentElement.classList.add("content");
  postElement.appendChild(contentElement);

  const actionsElement = document.createElement("div");
  actionsElement.classList.add("actions");

  const editElement = document.createElement("a");
  editElement.innerHTML = "Edit";
  editElement.href = "#";
  editElement.classList.add("edit");
  actionsElement.appendChild(editElement);

  const deleteElement = document.createElement("a");
  deleteElement.innerHTML = "Delete";
  deleteElement.href = "#";
  deleteElement.classList.add("delete");
  actionsElement.appendChild(deleteElement);

  postElement.appendChild(actionsElement);

  return postElement;
}

function createEmptyStateElement(): HTMLElement {
  const emptyStateElement = document.createElement("p");
  emptyStateElement.textContent = "No posts";
  emptyStateElement.classList.add("empty");
  return emptyStateElement;
}

function hideEmptyState(): void {
  const emptyStateElement = sectionPosts.querySelector(".empty");
  if (emptyStateElement) {
    emptyStateElement.remove();
  }
}

function showEmptyState(): void {
  if (
    sectionPosts.querySelectorAll(".post").length === 0 &&
    !sectionPosts.querySelector(".empty")
  ) {
    sectionPosts.appendChild(createEmptyStateElement());
  }
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

  hideEmptyState();

  sectionPosts.insertAdjacentElement("afterbegin", createPostElement(post));

  savePost(post);

  titleElement.value = "";
  authorElement.value = "";
  contentElement.value = "";
}

function loadPosts(): Post[] {
  const posts = getPostsFromLocalStorage();
  sectionPosts.innerHTML = "";

  if (posts.length == 0) {
    sectionPosts.appendChild(createEmptyStateElement());
    return [];
  } else {
    posts
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .forEach((post: Post) => {
        sectionPosts.appendChild(createPostElement(post));
      });

    return posts;
  }
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

  showEmptyState();
}

function editPost(postElement: HTMLElement): void {
  const actionsElement = postElement.querySelector<HTMLDivElement>(".actions")!;

  postElement.querySelector<HTMLParagraphElement>(".author")!.hidden = true;
  postElement.querySelector<HTMLParagraphElement>(".timestamp")!.hidden = true;

  const titleElement = postElement.querySelector<HTMLElement>(".title")!;
  const originalTitle = titleElement.textContent!;
  const titleInput = document.createElement("input");
  titleInput.classList.add("edit-title");
  titleInput.name = "title";
  titleInput.type = "text";
  titleInput.value = originalTitle;
  titleElement.replaceWith(titleInput);

  const contentElement = postElement.querySelector<HTMLElement>(".content")!;
  const originalContent = contentElement.textContent!;
  const contentTextarea = document.createElement("textarea");
  contentTextarea.value = originalContent;
  contentTextarea.classList.add("edit-content");
  contentElement.replaceWith(contentTextarea);

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", (event) => {
    updatePost(postElement, titleInput, contentTextarea);
    event.preventDefault();
  });

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", (event) => {
    restore(postElement, originalTitle, originalContent);
    event.preventDefault();
  });

  actionsElement.innerHTML = "";
  actionsElement.append(saveButton, cancelButton);
}

function updatePost(
  postElement: HTMLElement,
  titleInput: HTMLInputElement,
  contentTextarea: HTMLTextAreaElement
) {
  const newTitle = titleInput.value.trim();
  const newContent = contentTextarea.value.trim();

  if (!newTitle || !newContent) {
    return;
  }

  const posts: Post[] = getPostsFromLocalStorage();
  const postIndex = posts.findIndex((post) => post.id === postElement.id);

  if (postIndex !== -1) {
    posts[postIndex].title = newTitle;
    posts[postIndex].content = newContent;
    localStorage.setItem("posts", JSON.stringify(posts));
  }

  restore(postElement, newTitle, newContent);
}

function restore(postElement: HTMLElement, title: string, content: string) {
  const actionsElement = postElement.querySelector<HTMLDivElement>(".actions")!;

  postElement.querySelector<HTMLParagraphElement>(".author")!.hidden = false;
  postElement.querySelector<HTMLParagraphElement>(".timestamp")!.hidden = false;

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  titleElement.classList.add("title");
  const titleInput =
    postElement.querySelector<HTMLInputElement>(".edit-title")!;
  titleInput.replaceWith(titleElement);

  const contentElement = document.createElement("p");
  contentElement.textContent = content;
  contentElement.classList.add("content");
  const contentTextarea =
    postElement.querySelector<HTMLTextAreaElement>(".edit-content")!;
  contentTextarea.replaceWith(contentElement);

  const editElement = document.createElement("a");
  editElement.innerHTML = "Edit";
  editElement.href = "#";
  editElement.classList.add("edit");
  actionsElement.appendChild(editElement);

  const deleteElement = document.createElement("a");
  deleteElement.innerHTML = "Delete";
  deleteElement.href = "#";
  deleteElement.classList.add("delete");
  actionsElement.appendChild(deleteElement);

  actionsElement.innerHTML = "";
  actionsElement.append(editElement, deleteElement);
}
