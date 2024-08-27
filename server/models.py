from sqlalchemy import Table, Column, Integer, String, MetaData

metadata = MetaData()

user_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(50), unique=True, nullable=False),
    Column("password", String(255), nullable=False),
)

status_table = Table(
    "statuses",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, unique=True),
    Column("status", String(255)),
)