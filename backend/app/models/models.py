from pydantic import BaseModel

class Todo(BaseModel):
    id: int 
    title: str
    desc: str = ""
    completed: bool = False
    favourite: bool = False

class descriptionUpdate(BaseModel):
    description: str