// src/App.tsx
import { useState, useEffect } from "react";
import type { Todo } from "./types/todo";
import { getTodos, createTodo, toggleTodoStatus, removeTodo, updateTodoDesc, updateTodoFav} from "./api/todo";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const [watchFavs, setWatchFavs] = useState(false)

   //When rendering the page, fetch all todos
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = () => {
    getTodos().then((data) => {
      setTodos(data);
    });
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    console.log("he creado" + title)
    await createTodo(title)
    loadTodos()
  };

  const toggleTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    toggleTodoStatus(id, todo.completed).then(() => {
      //setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      // task 3 -The application should automatically fetch the todo list when:
      loadTodos()
    });
    
  };

  const deleteTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await removeTodo(id) 
    loadTodos()
  };

  const updateTodoDescription = async (id: number, desc: string) => {
    await updateTodoDesc(id, desc)
    loadTodos()
  }

  const updateTodoFavourite = async (id: number) => {
    await updateTodoFav(id)
    loadTodos()
  }
  

  return (
      
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          
          {selectedTodo && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
          <h2>{selectedTodo.title}</h2>

          <textarea
            className="border rounded p-2 w-full"
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="cursor-pointer" onClick={() => setSelectedTodo(null)}>
            Cancelar
            </button>

            <button className="cursor-pointer" 
            onClick={() => updateTodoDescription(selectedTodo.id, descriptionDraft ?? " ")}>
              guardar
            </button>
          </div>
          
        </div>
      </div>
    )}

    {watchFavs && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">

           <ul className="space-y-2">
              {todos.filter(todo => todo.favourite)
              .map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 ${
                    todo.completed ? "text-gray-400" : "" 
                  }`}
                >
                    <span> 
                      {todo.title}
                    </span>
                </li>
              ))}
            </ul>



           
            <div className="flex justify-end mt-2">
              <button className="cursor-pointer" onClick={() => setWatchFavs(false)}>
                Back
              </button>
            </div>
          
        </div>
      </div>

    )}

      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">ToDo List</h1>

        <div className="flex gap-2 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={loadTodos}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Load Tasks
          </button>
          <button
            onClick={() => setWatchFavs(prev => !prev)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
          >
            See Favourites
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="cursor-pointer"
              />

      
              <span className={todo.completed ? "text-gray-400" : ""}> 
                {todo.title}
              </span>

              <div className="ml-auto flex items-center gap-2">
                

                <button 
                  type="button"
                  className="cursor-pointer border border-blue-300 px-3 py-2 rounded"
                  onClick={() => {
                    setSelectedTodo(todo);
                    setDescriptionDraft(todo.desc ?? "");
                  }}>
                  Desc 
                </button>
                
                <button
                  type="button"
                  className="cursor-pointer border border-blue-300 px-3 py-2 rounded"
                  onClick={() => updateTodoFavourite(todo.id)}
                >
                  {todo.favourite ? "Unmark Fav" : "Mark as Fav"}
                </button>

                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => deleteTodo(todo.id)}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
