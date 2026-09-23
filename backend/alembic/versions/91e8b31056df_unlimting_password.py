"""unlimting password

Revision ID: 91e8b31056df
Revises: 386df9a754e3
Create Date: 2026-09-17 14:24:06.811963

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91e8b31056df'
down_revision: Union[str, Sequence[str], None] = '386df9a754e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("users", "password", 
                    existing_type=sa.String,
                    existing_nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("users", "password", 
                    existing_type=sa.String(200),
                    existing_nullable=False)
