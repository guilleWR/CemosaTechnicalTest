from fastapi import APIRouter, Depends
from ..models.models import Todo, descriptionUpdate
from ..services.todoService import TodoService
from ..deps import _get_todo_service

router = APIRouter()

@router.get("/todos", response_model=list[Todo])
def get_todos(service: TodoService = Depends(_get_todo_service)):
    return service.load_todos()

@router.post("/todos", response_model=Todo)
def add_todo(todo: Todo, service: TodoService = Depends(_get_todo_service)):
    return service.add_todo(todo)

@router.patch("/todos/{id}")
def update_todo_favourite(id: int, service: TodoService = Depends(_get_todo_service)):
    service.update_favourite_status(id)

@router.patch("/todos/{id}/{currentStatus}", response_model=Todo)
def update_todo_status(id: int, currentStatus: bool, service: TodoService = Depends(_get_todo_service)):
    return service.update_todo_status(id, currentStatus)

@router.delete("/todos/{id}")
def remove_todo(id: int, service: TodoService = Depends(_get_todo_service)):
    service.remove_todo(id)
    
@router.put("/todos/{id}")
def update_todo_description(id: int, data: descriptionUpdate, service: TodoService = Depends(_get_todo_service)):
    service.update_todo_description(id, data)