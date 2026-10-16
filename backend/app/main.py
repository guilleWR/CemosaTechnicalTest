import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATA_FILE = Path(__file__).parent / "todos.json"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Todo(BaseModel):
    id: int 
    title: str
    completed: bool = False


def load_todos() -> list[Todo]:
    """Load todos from the JSON file."""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return [Todo(**todo) for todo in json.load(f)]


def save_todos(todos: list[Todo]):
    """
    Save todos to the JSON file.

    Args:
        todos (list[Todo]): List of Todo objects to save.
    """
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([todo.model_dump() for todo in todos], f, indent=2)


@app.get("/todos", response_model=list[Todo])
def get_todos():
    """Get all todos."""
    return load_todos()

@app.post("/todos", response_model=Todo)
def add_todo(todo: Todo):
    """
    Add a new todo.

    Args:
        todo (Todo): The todo to add.
    """
    todos = load_todos()

    todo.id = todos[-1].id + 1
    todos.append(todo)
    
    save_todos(todos)
    return todo

##################################################
#NEW

#O(N)
@app.patch("/todos/{id}/{currentStatus}", response_model=Todo)
def update_todo_status(id: int, currentStatus: bool):

    with open(DATA_FILE, "r", encoding="utf8") as f:
        lista = []
        updated_todo = None
        for todo in json.load(f):
            t = Todo(**todo)
            if t.id == id:
                t.completed = not currentStatus #Invert status
                updated_todo = t
            lista.append(t)

        save_todos(lista)
        return updated_todo


@app.delete("/todos/remove/{id}")
def remove_todo(id: int):
    todos = load_todos()
    new_list = [todo for todo in todos if todo.id != id]
    save_todos(new_list)
    


