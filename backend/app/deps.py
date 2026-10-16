from pathlib import Path
from .services.todoService import TodoService

DATA_FILE = Path(__file__).parent / "todos.json"

def _get_todo_service() -> TodoService:
    return TodoService(DATA_FILE)