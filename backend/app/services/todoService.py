import json
from pathlib import Path
from ..models.models import Todo, descriptionUpdate


class TodoService:

    def __init__(self, data_file: Path):
        self.data_file = data_file


    """Get all todos."""
    def load_todos(self) -> list[Todo]:
        """Load todos from the JSON file."""
        with open(self.data_file, "r", encoding="utf-8") as f:
            return [Todo(**todo) for todo in json.load(f)]


    def save_todos(self, todos: list[Todo]):
        """
        Save todos to the JSON file.
        Args:
            todos (list[Todo]): List of Todo objects to save.
        """
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump([todo.model_dump() for todo in todos], f, indent=2)


    def add_todo(self, todo: Todo) -> Todo:
        todos = self.load_todos()

        # Possible improvement: use Python's UUID function
        if todos:
            todo.id = todos[-1].id + 1
        else:
            todo.id = 1
        todos.append(todo)
        self.save_todos(todos)

        return todo


    def update_favourite_status(self, id: int) -> None:
        todos = self.load_todos()
        for todo in todos:
            if todo.id == id:
                todo.favourite = not todo.favourite # inverse
                break
        self.save_todos(todos)   


    def update_todo_status(self, id: int, currentStatus: bool) -> Todo:
        todos = self.load_todos()
        for todo in todos:
            if todo.id == id:
                todo.completed = not currentStatus
                self.save_todos(todos)
                return todo


    def update_todo_description(self, id: int, data: descriptionUpdate) -> None:
        todos = self.load_todos()
        for todo in todos:
            if todo.id == id:
                todo.desc = data.description
                break
        self.save_todos(todos)


    def remove_todo(self, id: int) -> None:
        todos = self.load_todos()
        new_list = [todo for todo in todos if todo.id != id]
        self.save_todos(new_list)

    


     