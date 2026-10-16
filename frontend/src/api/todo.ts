import type { Todo } from "../types/todo";

const BASE_URL = "http://localhost:8000/todos";

export const getTodos = async (): Promise<Todo[]> => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Error fetching todos");
  return res.json();
};

export const createTodo = async (title: string): Promise<void> => {
  await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify({id: 0, desc: "", title, completed: false, }),
  });
};

export const toggleTodoStatus = async (
  id: number,
  currentStatus: boolean
): Promise<Todo> => {
  const res = await fetch(`${BASE_URL}/${id}/${currentStatus}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed: !currentStatus }),
  });
  if (!res.ok) throw new Error("Error toggling todo status");
  return res.json();
};

///////////////////////

export const removeTodo = async (id: number): Promise<void> => {
  await fetch(`${BASE_URL}/remove/${id}`, {
    method: "DELETE",
  });
};


export const updateTodoDesc = async (id: number, description: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/desc/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!res.ok) throw new Error("Error al guardar la descripción");
};
