"""trying with double quotes

Revision ID: 9cbc73448659
Revises: fb99d83b9ca7
Create Date: 2026-09-16 15:40:34.015663

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9cbc73448659'
down_revision: Union[str, Sequence[str], None] = 'fb99d83b9ca7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('orders', 'is_took',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("FALSE"))
    op.alter_column('orders', 'payed_to_taker',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("FALSE"))
    op.alter_column('orders', 'received',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("FALSE"))
    op.alter_column('orders', 'done',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("FALSE"))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('orders', 'done',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("TRUE"))
    op.alter_column('orders', 'received',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("TRUE"))
    op.alter_column('orders', 'payed_to_taker',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("TRUE"))
    op.alter_column('orders', 'is_took',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text("TRUE"))
