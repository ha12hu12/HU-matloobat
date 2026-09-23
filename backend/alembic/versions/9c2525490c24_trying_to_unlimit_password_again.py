"""trying to unlimit password again

Revision ID: 9c2525490c24
Revises: 91e8b31056df
Create Date: 2026-09-17 17:11:16.832807

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c2525490c24'
down_revision: Union[str, Sequence[str], None] = '91e8b31056df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("users", "password",
                    existing_type=sa.String(50),
                    type_=sa.String)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("users", "password",
                    existing_type=sa.String,
                    type_=sa.String(50))
